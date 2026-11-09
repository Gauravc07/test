-- Ratings after a deal: brand and creator rate each other, 1 to 5 stars
-- with an optional comment, once the collaboration is complete.
--
-- Double-blind: a review stays hidden from everyone but its author until
-- the other side has reviewed too, or 14 days have passed. Nobody can wait
-- to see a bad rating and retaliate. Reviews can't be edited or deleted
-- from the app.

create table public.reviews (
  id                uuid primary key default gen_random_uuid(),
  collaboration_id  uuid not null references public.collaborations (id) on delete cascade,
  reviewer_id       uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  reviewee_id       uuid not null references public.profiles (id) on delete cascade,
  rating            smallint not null check (rating between 1 and 5),
  comment           text check (char_length(comment) <= 1000),
  created_at        timestamptz not null default now(),
  unique (collaboration_id, reviewer_id)
);

create index reviews_reviewee_idx on public.reviews (reviewee_id, created_at desc);

-- Days after which a one-sided review is shown anyway.
create function public.review_blind_days()
returns integer language sql immutable set search_path = ''
as $$ select 14 $$;

create function public.reviews_before_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid    uuid := auth.uid();
  v_collab public.collaborations;
begin
  select * into v_collab from public.collaborations where id = new.collaboration_id;
  if not found then
    raise exception 'collaboration not found' using errcode = '23503';
  end if;
  if v_uid is not null then
    new.reviewer_id := v_uid;
  end if;
  if new.reviewer_id not in (v_collab.brand_id, v_collab.creator_id) then
    raise exception 'only the brand and creator on this collaboration can review it'
      using errcode = '42501';
  end if;
  if v_collab.status <> 'completed' then
    raise exception 'you can leave a review once the collaboration is complete'
      using errcode = '42501';
  end if;
  new.reviewee_id := case when new.reviewer_id = v_collab.brand_id
                          then v_collab.creator_id else v_collab.brand_id end;
  new.comment := nullif(trim(new.comment), '');
  new.created_at := now();
  return new;
end;
$$;

create trigger reviews_before_insert
  before insert on public.reviews
  for each row execute function public.reviews_before_insert();

create trigger reject_blocked_terms before insert on public.reviews
  for each row execute function public.reject_blocked_terms('comment');

-- True once a review may be shown to people other than its author.
create function public.review_published(p_review public.reviews)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select p_review.created_at <= now() - make_interval(days => public.review_blind_days())
      or exists (select 1 from public.reviews r
                  where r.collaboration_id = p_review.collaboration_id
                    and r.reviewer_id = p_review.reviewee_id);
$$;

revoke all on public.reviews from anon, authenticated;
grant select on public.reviews to authenticated;
grant insert (collaboration_id, rating, comment) on public.reviews to authenticated;

alter table public.reviews enable row level security;

create policy "reviews are visible to their author, and to everyone once published"
  on public.reviews for select to authenticated
  using (reviewer_id = (select auth.uid()) or public.review_published(reviews));
create policy "people review their own collaborations"
  on public.reviews for insert to authenticated
  with check (reviewer_id = (select auth.uid()));

-------------------------------------------------------------------------------
-- Summaries for profiles and the media kit
-------------------------------------------------------------------------------

create function public.rating_summary(p_user uuid)
returns table (average numeric, count integer)
language sql
stable
security definer
set search_path = ''
as $$
  select round(avg(r.rating)::numeric, 1), count(*)::integer
    from public.reviews r
   where r.reviewee_id = p_user and public.review_published(r);
$$;

-- Published reviews of one person, newest first, with who wrote them.
create function public.profile_reviews(p_user uuid, p_limit integer default 20)
returns table (
  id             uuid,
  rating         smallint,
  comment        text,
  created_at     timestamptz,
  reviewer_name  text,
  campaign_title text
)
language sql
stable
security definer
set search_path = ''
as $$
  select r.id, r.rating, r.comment, r.created_at,
         public.display_name(r.reviewer_id), c.title
    from public.reviews r
    join public.collaborations co on co.id = r.collaboration_id
    join public.campaigns c on c.id = co.campaign_id
   where r.reviewee_id = p_user and public.review_published(r)
   order by r.created_at desc
   limit least(greatest(p_limit, 1), 50);
$$;

revoke execute on function public.review_published(public.reviews),
                           public.rating_summary(uuid),
                           public.profile_reviews(uuid, integer),
                           public.reviews_before_insert()
  from public, anon;
grant execute on function public.review_published(public.reviews),
                          public.rating_summary(uuid),
                          public.profile_reviews(uuid, integer)
  to authenticated;

-- Brands see creators' ratings while searching.
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
  coalesce(rs.count, 0)        as rating_count
from public.profiles p
join public.creator_profiles cp on cp.id = p.id
left join public.social_accounts sa on sa.creator_id = p.id and sa.platform = 'instagram'
left join lateral public.rating_summary(p.id) rs on true;

-------------------------------------------------------------------------------
-- Notify the person reviewed
-------------------------------------------------------------------------------

create function public.notify_review()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_campaign text;
  v_mutual   boolean;
begin
  select c.title into v_campaign
    from public.collaborations co join public.campaigns c on c.id = co.campaign_id
   where co.id = new.collaboration_id;
  v_mutual := exists (select 1 from public.reviews r
                       where r.collaboration_id = new.collaboration_id
                         and r.reviewer_id = new.reviewee_id);
  perform public.notify(new.reviewee_id, new.reviewer_id, 'review_received',
    public.display_name(new.reviewer_id) || ' reviewed your work on ' || v_campaign,
    case when v_mutual then 'Both reviews are now on your profiles.'
         else 'Leave your review to see theirs. Both appear on your profiles once you do, or after '
              || public.review_blind_days() || ' days.' end,
    new.collaboration_id);
  return null;
end;
$$;

create trigger notify_review
  after insert on public.reviews
  for each row execute function public.notify_review();

revoke execute on function public.notify_review() from public, anon, authenticated;
