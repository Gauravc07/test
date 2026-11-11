-- Creator quality score and audience search.
--
--   Quality score (0-100) uses only what is public on Instagram anyway:
--   engagement against creators of the same size, how often they post,
--   comments relative to likes, and sudden follower jumps. It is computed
--   for every verified creator.
--
--   Audience search (gender, age, top cities, share in India) uses private
--   insights, so it is only filled in for creators who turn on "Let brands
--   search by my audience". Turning it off clears it straight away.
--
--   Both are stored in creator_stats, refreshed after every Instagram sync,
--   so searching never recomputes them.

alter table public.creator_profiles
  add column share_audience boolean not null default false;

grant update (share_audience) on public.creator_profiles to authenticated;

comment on column public.creator_profiles.share_audience is
  'Creator''s consent to let brands search and see their audience breakdown.';

create table public.creator_stats (
  creator_id            uuid primary key references public.creator_profiles (id) on delete cascade,
  quality_score         smallint check (quality_score between 0 and 100),
  quality_flags         text[] not null default '{}',
  engagement_rate       numeric(6, 2),
  posts_90d             integer,
  -- Audience, only with consent.
  aud_female_share      numeric(5, 1),
  aud_age_18_34_share   numeric(5, 1),
  aud_india_share       numeric(5, 1),
  aud_top_cities        text[] not null default '{}',
  aud_cities_text       text,
  computed_at           timestamptz not null default now()
);

revoke all on public.creator_stats from anon, authenticated;
grant select on public.creator_stats to authenticated;
alter table public.creator_stats enable row level security;
create policy "signed-in users see creator stats"
  on public.creator_stats for select to authenticated using (true);

create function public.refresh_creator_stats(p_creator uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_account    public.instagram_accounts;
  v_share      boolean;
  v_followers  integer;
  v_benchmark  numeric;
  v_er         numeric;
  v_posts      integer;
  v_likes      numeric;
  v_comments   numeric;
  v_ratio      numeric;
  v_jump       numeric;
  v_jump_day   date;
  v_snapshots  integer;
  v_score      integer := 0;
  v_flags      text[] := '{}';
  v_female     numeric;
  v_young      numeric;
  v_india      numeric;
  v_cities     text[];
begin
  select share_audience into v_share from public.creator_profiles where id = p_creator;
  if not found then
    return;
  end if;
  select * into v_account from public.instagram_accounts
   where creator_id = p_creator and status = 'active';

  if v_account.id is null or coalesce(v_account.followers_count, 0) = 0 then
    delete from public.creator_stats where creator_id = p_creator;
    return;
  end if;
  v_followers := v_account.followers_count;
  v_benchmark := case when v_followers < 10000 then 4.0
                      when v_followers < 100000 then 2.5
                      when v_followers < 500000 then 1.5
                      else 1.0 end;

  -- Engagement on the latest 12 posts from the last 90 days.
  select avg((coalesce(like_count, 0) + coalesce(comments_count, 0))::numeric / v_followers * 100),
         sum(coalesce(like_count, 0)), sum(coalesce(comments_count, 0))
    into v_er, v_likes, v_comments
    from (select like_count, comments_count from public.instagram_media
           where account_id = v_account.id
             and posted_at >= now() - interval '90 days'
             and coalesce(media_product_type, '') <> 'STORY'
           order by posted_at desc limit 12) p;
  select count(*) into v_posts from public.instagram_media
   where account_id = v_account.id and posted_at >= now() - interval '90 days'
     and coalesce(media_product_type, '') <> 'STORY';

  if v_posts < 3 then
    v_flags := v_flags || 'Too few recent posts to score'::text;
    v_score := null;
  else
    -- Engagement: up to 40, full marks at 1.25x the typical rate for their size.
    v_score := v_score + least(40, round(40 * v_er / (v_benchmark * 1.25)))::integer;
    if v_er >= v_benchmark * 1.5 then
      v_flags := v_flags || format('Engagement %sx typical for their size', round(v_er / v_benchmark, 1));
    elsif v_er < v_benchmark * 0.5 then
      v_flags := v_flags || 'Engagement low for their size'::text;
    end if;

    -- Consistency: up to 20, full at 12+ posts in 90 days (about weekly).
    v_score := v_score + least(20, v_posts * 20 / 12);
    if v_posts >= 24 then
      v_flags := v_flags || 'Posts more than twice a week'::text;
    elsif v_posts < 6 then
      v_flags := v_flags || 'Posts rarely'::text;
    end if;

    -- Comments vs likes: bought likes rarely come with comments.
    v_ratio := case when v_likes > 0 then v_comments / v_likes * 100 end;
    if v_ratio is null or v_ratio < 0.2 then
      v_flags := v_flags || 'Very few comments for the likes'::text;
    elsif v_ratio between 0.5 and 20 then
      v_score := v_score + 20;
    else
      v_score := v_score + 10;
    end if;

    -- Follower growth: a sudden jump often means bought followers.
    select count(*) into v_snapshots from public.instagram_account_snapshots
     where account_id = v_account.id and captured_on >= current_date - 90;
    select max(jump), (array_agg(captured_on order by jump desc nulls last))[1]
      into v_jump, v_jump_day
      from (select captured_on,
                   (followers_count - lag(followers_count) over (order by captured_on))::numeric
                     / nullif(lag(followers_count) over (order by captured_on), 0) as jump,
                   followers_count - lag(followers_count) over (order by captured_on) as gained
              from public.instagram_account_snapshots
             where account_id = v_account.id and captured_on >= current_date - 90) s
     where gained > 1000;
    if v_snapshots < 2 then
      v_score := v_score + 15;
    elsif coalesce(v_jump, 0) > 0.15 then
      v_flags := v_flags || format('Sudden follower jump on %s', to_char(v_jump_day, 'DD Mon'));
    else
      v_score := v_score + 20;
      v_flags := v_flags || 'Steady follower growth'::text;
    end if;
  end if;

  if v_share then
    select round(sum(value) filter (where dimension = 'F')::numeric / nullif(sum(value), 0) * 100, 1)
      into v_female from public.instagram_audience
     where account_id = v_account.id and breakdown = 'gender';
    select round(sum(value) filter (where dimension in ('18-24', '25-34'))::numeric / nullif(sum(value), 0) * 100, 1)
      into v_young from public.instagram_audience
     where account_id = v_account.id and breakdown = 'age';
    select round(sum(value) filter (where dimension = 'IN')::numeric / nullif(sum(value), 0) * 100, 1)
      into v_india from public.instagram_audience
     where account_id = v_account.id and breakdown = 'country';
    select array_agg(city order by value desc)
      into v_cities
      from (select trim(split_part(dimension, ',', 1)) as city, value
              from public.instagram_audience
             where account_id = v_account.id and breakdown = 'city'
             order by value desc limit 5) c;
  end if;

  insert into public.creator_stats as s
    (creator_id, quality_score, quality_flags, engagement_rate, posts_90d,
     aud_female_share, aud_age_18_34_share, aud_india_share, aud_top_cities, aud_cities_text, computed_at)
  values
    (p_creator, v_score, v_flags, round(v_er, 2), v_posts,
     v_female, v_young, v_india, coalesce(v_cities, '{}'), array_to_string(v_cities, ', '), now())
  on conflict (creator_id) do update set
     quality_score = excluded.quality_score, quality_flags = excluded.quality_flags,
     engagement_rate = excluded.engagement_rate, posts_90d = excluded.posts_90d,
     aud_female_share = excluded.aud_female_share, aud_age_18_34_share = excluded.aud_age_18_34_share,
     aud_india_share = excluded.aud_india_share, aud_top_cities = excluded.aud_top_cities,
     aud_cities_text = excluded.aud_cities_text, computed_at = excluded.computed_at;
end;
$$;

-- Turning audience sharing on or off takes effect immediately.
create function public.creator_share_audience_changed()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.refresh_creator_stats(new.id);
  return null;
end;
$$;

create trigger creator_share_audience_changed
  after update of share_audience on public.creator_profiles
  for each row when (old.share_audience is distinct from new.share_audience)
  execute function public.creator_share_audience_changed();

-- Disconnecting Instagram removes the stats.
create function public.instagram_account_removed()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from public.creator_stats where creator_id = old.creator_id;
  return old;
end;
$$;

create trigger instagram_account_removed
  after delete on public.instagram_accounts
  for each row execute function public.instagram_account_removed();

revoke execute on function public.refresh_creator_stats(uuid),
                           public.creator_share_audience_changed(),
                           public.instagram_account_removed()
  from public, anon, authenticated;
grant execute on function public.refresh_creator_stats(uuid) to service_role;

select public.refresh_creator_stats(id) from public.creator_profiles;

-- Search: quality and (with consent) audience, next to each creator.
create or replace view public.creator_directory
with (security_invoker = true) as
select
  p.id,
  p.full_name,
  p.avatar_url,
  cp.handle,
  cp.bio,
  cp.niches,
  cp.location,
  cp.rate_min,
  cp.rate_max,
  cp.currency,
  sa.handle                    as instagram_handle,
  sa.profile_url               as instagram_url,
  sa.followers                 as instagram_followers,
  sa.engagement_rate           as instagram_engagement,
  coalesce(sa.verified, false) as instagram_verified,
  p.created_at,
  rs.average                   as rating_average,
  coalesce(rs.count, 0)        as rating_count,
  st.quality_score,
  coalesce(st.quality_flags, '{}') as quality_flags,
  st.aud_female_share,
  st.aud_age_18_34_share,
  st.aud_india_share,
  coalesce(st.aud_top_cities, '{}') as aud_top_cities,
  st.aud_cities_text
from public.profiles p
join public.creator_profiles cp on cp.id = p.id
left join public.social_accounts sa on sa.creator_id = p.id and sa.platform = 'instagram'
left join public.creator_stats st on st.creator_id = p.id
left join lateral public.rating_summary(p.id) rs on true;
