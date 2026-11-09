-- Public media kit: a page at /kit/<handle> that anyone can open, showing a
-- creator's verified Instagram numbers, audience, best recent posts,
-- rates and Shor reviews.
--
-- Off by default. The creator turns it on in their profile, which is their
-- consent to share these Instagram insights publicly. Turning it off, or
-- disconnecting Instagram, removes them from the page straight away: the
-- page reads live data and stores no copy.

alter table public.creator_profiles
  add column media_kit_public boolean not null default false;

grant update (media_kit_public) on public.creator_profiles to authenticated;

comment on column public.creator_profiles.media_kit_public is
  'Creator''s consent to show their media kit, including Instagram insights, at /kit/<handle>.';

-- The whole kit as JSON, or null if there is no such public kit. The owner
-- can always load their own, to preview it before publishing.
create function public.media_kit(p_handle text)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_creator  public.creator_profiles;
  v_profile  public.profiles;
  v_social   public.social_accounts;
  v_account  public.instagram_accounts;
  v_since    timestamptz := now() - interval '90 days';
  v_posts    jsonb;
  v_stats    jsonb;
  v_audience jsonb;
  v_rating   record;
  v_deals    integer;
begin
  select * into v_creator
    from public.creator_profiles
   where lower(handle) = lower(ltrim(trim(p_handle), '@'));
  -- coalesce: for visitors auth.uid() is null, and "id = null" is null, not false.
  if not found or not (v_creator.media_kit_public
                       or coalesce(v_creator.id = auth.uid(), false)) then
    return null;
  end if;

  select * into v_profile from public.profiles where id = v_creator.id;
  select * into v_social from public.social_accounts
   where creator_id = v_creator.id and platform = 'instagram';
  select * into v_account from public.instagram_accounts
   where creator_id = v_creator.id and status = 'active';

  if v_account.id is not null then
    -- Averages over posts from the last 90 days with synced insights.
    select jsonb_build_object(
             'posts',            count(*),
             'avg_views',        round(avg(m.views)),
             'avg_reach',        round(avg(m.reach)),
             'avg_interactions', round(avg(coalesce(m.total_interactions,
                                   coalesce(m.like_count, 0) + coalesce(m.comments_count, 0)
                                   + coalesce(m.saved, 0) + coalesce(m.shares, 0)))),
             'engagement_rate',  case when sum(m.reach) > 0 then
                                   round(sum(coalesce(m.total_interactions,
                                     coalesce(m.like_count, 0) + coalesce(m.comments_count, 0)
                                     + coalesce(m.saved, 0) + coalesce(m.shares, 0)))::numeric
                                     / sum(m.reach) * 100, 1) end)
      into v_stats
      from public.instagram_media m
     where m.account_id = v_account.id
       and m.posted_at >= v_since
       and m.insights_updated_at is not null
       and coalesce(m.media_product_type, '') <> 'STORY';

    select coalesce(jsonb_agg(p order by p.views desc nulls last), '[]'::jsonb)
      into v_posts
      from (select m.permalink, coalesce(m.thumbnail_url, m.media_url) as image_url,
                   m.media_type, m.media_product_type, m.posted_at,
                   m.views, m.reach, m.like_count as likes, m.comments_count as comments,
                   m.saved, m.shares
              from public.instagram_media m
             where m.account_id = v_account.id
               and m.posted_at >= v_since
               and coalesce(m.media_product_type, '') <> 'STORY'
             order by m.views desc nulls last, m.posted_at desc
             limit 6) p;

    -- Top values per breakdown, as shares of the total.
    select coalesce(jsonb_object_agg(b.breakdown, b.items), '{}'::jsonb)
      into v_audience
      from (select a.breakdown,
                   jsonb_agg(jsonb_build_object('label', a.dimension, 'share',
                               round(a.value::numeric / nullif(t.total, 0) * 100, 1))
                             order by a.value desc) filter (where a.rank <= 5) as items
              from (select x.*, row_number() over (partition by x.breakdown order by x.value desc) as rank
                      from public.instagram_audience x
                     where x.account_id = v_account.id) a
              join (select breakdown, sum(value) as total
                      from public.instagram_audience
                     where account_id = v_account.id
                     group by breakdown) t on t.breakdown = a.breakdown
             group by a.breakdown) b;
  end if;

  select * into v_rating from public.rating_summary(v_creator.id);
  select count(*) into v_deals from public.collaborations
   where creator_id = v_creator.id and status = 'completed';

  return jsonb_build_object(
    'id',          v_creator.id,
    'handle',      v_creator.handle,
    'name',        coalesce(nullif(trim(v_profile.full_name), ''), v_account.name, v_creator.handle),
    'avatar_url',  coalesce(v_profile.avatar_url, v_account.profile_picture_url),
    'bio',         v_creator.bio,
    'niches',      to_jsonb(v_creator.niches),
    'location',    v_creator.location,
    'rate_min',    v_creator.rate_min,
    'rate_max',    v_creator.rate_max,
    'currency',    v_creator.currency,
    'is_public',   v_creator.media_kit_public,
    'instagram',   case when v_social.id is null then null else jsonb_build_object(
                     'username',        coalesce(v_account.username, v_social.handle),
                     'url',             coalesce(v_social.profile_url,
                                          'https://www.instagram.com/' || coalesce(v_account.username, v_social.handle) || '/'),
                     'followers',       coalesce(v_account.followers_count, v_social.followers),
                     'media_count',     v_account.media_count,
                     'verified',        v_social.verified,
                     'engagement_rate', v_social.engagement_rate,
                     'synced_at',       v_account.last_synced_at) end,
    'stats',       v_stats,
    'top_posts',   coalesce(v_posts, '[]'::jsonb),
    'audience',    coalesce(v_audience, '{}'::jsonb),
    'deals_completed', v_deals,
    'rating',      jsonb_build_object('average', v_rating.average, 'count', coalesce(v_rating.count, 0)),
    'reviews',     (select coalesce(jsonb_agg(to_jsonb(r)), '[]'::jsonb)
                      from public.profile_reviews(v_creator.id, 3) r)
  );
end;
$$;

revoke execute on function public.media_kit(text) from public;
grant execute on function public.media_kit(text) to anon, authenticated;
