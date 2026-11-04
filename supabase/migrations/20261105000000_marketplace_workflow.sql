-- Brand ↔ creator marketplace workflow (Instagram only).
--
--   Brand: discover creators → shortlist → write a campaign brief → publish
--          (open to applications or invite-only) → invite / review
--          applications → review drafts → verify the live post → report →
--          approve the creator's invoice.
--   Creator: browse open campaigns → apply (with a quote if allowed) or
--          accept an invite → submit a draft → post on Instagram and submit
--          the live link → request payment.
--
-- Builds on the initial schema (campaigns, collaborations, shortlists,
-- invoices, conversations) and the Instagram insights tables.

-------------------------------------------------------------------------------
-- Campaign brief fields
-------------------------------------------------------------------------------

create type public.campaign_visibility as enum ('open', 'invite_only');
create type public.compensation_type as enum ('paid', 'barter', 'paid_and_product');

alter table public.campaigns
  add column visibility            public.campaign_visibility not null default 'open',
  add column compensation_type     public.compensation_type not null default 'paid',
  -- Offer per creator. With accepts_quotes, creators may propose their own.
  add column payout_per_creator    numeric(14, 2) check (payout_per_creator >= 0),
  add column accepts_quotes        boolean not null default true,
  add column product_details       text check (char_length(product_details) <= 2000),
  add column guidelines            text check (char_length(guidelines) <= 5000),
  add column application_deadline  date,
  add column creator_slots         integer check (creator_slots between 1 and 1000),
  add column min_followers         integer not null default 0 check (min_followers >= 0),
  add column cities                text[] not null default '{}';

-- Shor is Instagram-only for now.
alter table public.campaigns alter column platforms set default '{instagram}';

grant insert (visibility, compensation_type, payout_per_creator, accepts_quotes,
              product_details, guidelines, application_deadline, creator_slots,
              min_followers, cities)
  on public.campaigns to authenticated;
grant update (visibility, compensation_type, payout_per_creator, accepts_quotes,
              product_details, guidelines, application_deadline, creator_slots,
              min_followers, cities)
  on public.campaigns to authenticated;

-- Invite-only campaigns are hidden from creators who were not invited.
drop policy "campaigns are visible to their brand, when live, or to collaborators"
  on public.campaigns;
create policy "campaigns are visible to their brand, open when live, or to collaborators"
  on public.campaigns for select to authenticated
  using (
    brand_id = (select auth.uid())
    or (visibility = 'open' and status in ('active', 'paused', 'completed'))
    or exists (select 1 from public.collaborations c
                where c.campaign_id = campaigns.id
                  and c.creator_id = (select auth.uid()))
  );

-------------------------------------------------------------------------------
-- Collaboration rules (replaces the initial guard)
-------------------------------------------------------------------------------

create or replace function public.collaborations_guard()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid      uuid := auth.uid();  -- null for service role / direct SQL
  v_campaign public.campaigns;
  v_move     text;
  v_taken    integer;
begin
  if tg_op = 'INSERT' then
    select * into v_campaign from public.campaigns where id = new.campaign_id;
    if not found then
      raise exception 'campaign % not found', new.campaign_id using errcode = '23503';
    end if;
    new.brand_id := v_campaign.brand_id;
    new.currency := v_campaign.currency;

    if v_uid is not null then
      if v_uid = new.creator_id then
        if new.status <> 'applied' then
          raise exception 'creators start a collaboration by applying' using errcode = '42501';
        end if;
        if v_campaign.status <> 'active' or v_campaign.visibility <> 'open' then
          raise exception 'this campaign is not accepting applications' using errcode = '42501';
        end if;
        if v_campaign.application_deadline is not null
           and v_campaign.application_deadline < current_date then
          raise exception 'applications for this campaign have closed' using errcode = '42501';
        end if;
        -- Fixed-price campaigns: the offer is the price.
        if not v_campaign.accepts_quotes or v_campaign.compensation_type = 'barter' then
          new.agreed_amount := case when v_campaign.compensation_type = 'barter'
                                    then null else v_campaign.payout_per_creator end;
        end if;
        new.deliverables := v_campaign.deliverables;
      elsif v_uid = new.brand_id then
        if new.status <> 'invited' then
          raise exception 'brands start a collaboration by inviting' using errcode = '42501';
        end if;
        if v_campaign.status not in ('draft', 'active', 'paused') then
          raise exception 'you can only invite creators to a draft, active or paused campaign'
            using errcode = '42501';
        end if;
        if new.agreed_amount is null and v_campaign.compensation_type <> 'barter' then
          new.agreed_amount := v_campaign.payout_per_creator;
        end if;
        if new.deliverables = '{}'::jsonb then
          new.deliverables := v_campaign.deliverables;
        end if;
      else
        raise exception 'not a party to this collaboration' using errcode = '42501';
      end if;
    end if;
    return new;
  end if;

  -- UPDATE
  if new.campaign_id <> old.campaign_id
     or new.creator_id <> old.creator_id
     or new.brand_id <> old.brand_id then
    raise exception 'a collaboration cannot be moved to another campaign, creator or brand'
      using errcode = '42501';
  end if;

  if v_uid is null then
    return new;
  end if;

  if v_uid = old.creator_id and (
       new.agreed_amount is distinct from old.agreed_amount
       or new.deliverables is distinct from old.deliverables
       or new.due_date is distinct from old.due_date) then
    raise exception 'only the brand can change the terms' using errcode = '42501';
  end if;

  if v_uid = old.brand_id and (
       new.pitch is distinct from old.pitch
       or new.content_urls is distinct from old.content_urls) then
    raise exception 'only the creator can change the pitch or submitted content'
      using errcode = '42501';
  end if;

  if new.status is distinct from old.status then
    v_move := old.status::text || '>' || new.status::text;
    if v_uid = old.creator_id and v_move = any (array[
         'invited>accepted', 'invited>declined', 'applied>cancelled',
         'accepted>in_progress', 'in_progress>awaiting_approval']) then
      null;
    elsif v_uid = old.brand_id and v_move = any (array[
         'applied>accepted', 'applied>declined', 'invited>cancelled',
         'accepted>cancelled', 'in_progress>cancelled',
         'awaiting_approval>completed', 'awaiting_approval>in_progress']) then
      null;
    else
      raise exception 'status change % is not allowed', v_move using errcode = '42501';
    end if;

    -- Respect the number of creators the brand asked for.
    if new.status = 'accepted' then
      select * into v_campaign from public.campaigns where id = new.campaign_id;
      if v_campaign.creator_slots is not null then
        select count(*) into v_taken from public.collaborations
         where campaign_id = new.campaign_id and id <> new.id
           and status in ('accepted', 'in_progress', 'awaiting_approval', 'completed');
        if v_taken >= v_campaign.creator_slots then
          raise exception 'all % creator slots on this campaign are filled', v_campaign.creator_slots
            using errcode = '42501';
        end if;
      end if;
    end if;
  end if;

  return new;
end;
$$;

-------------------------------------------------------------------------------
-- Content submissions: draft for review, then the live Instagram post
-------------------------------------------------------------------------------

create type public.submission_kind as enum ('draft', 'live');
create type public.submission_status as enum ('pending', 'approved', 'changes_requested');

create table public.collaboration_submissions (
  id                uuid primary key default gen_random_uuid(),
  collaboration_id  uuid not null references public.collaborations (id) on delete cascade,
  creator_id        uuid not null references public.creator_profiles (id) on delete cascade, -- copied
  brand_id          uuid not null references public.brand_profiles (id) on delete cascade,   -- copied
  kind              public.submission_kind not null,
  -- Draft: a link to the content (Drive, Dropbox, etc.).
  -- Live: the Instagram post or reel URL.
  content_url       text not null check (content_url ~ '^https://' and char_length(content_url) <= 1000),
  caption           text check (char_length(caption) <= 2200),
  notes             text check (char_length(notes) <= 2000),
  status            public.submission_status not null default 'pending',
  feedback          text check (char_length(feedback) <= 2000),
  -- Matched Instagram media (live posts), filled from the creator's synced posts.
  ig_media_id       text,
  created_at        timestamptz not null default now(),
  reviewed_at       timestamptz
);

create index collaboration_submissions_collab_idx
  on public.collaboration_submissions (collaboration_id, created_at desc);
create index collaboration_submissions_creator_idx
  on public.collaboration_submissions (creator_id) where kind = 'live';
create index collaboration_submissions_brand_idx
  on public.collaboration_submissions (brand_id);

/** Canonical form of an Instagram post URL, or null if it is not one. */
create function public.instagram_permalink(p_url text)
returns text
language sql
immutable
set search_path = ''
as $$
  select case
    when m is null then null
    else 'https://www.instagram.com/' || m[1] || '/' || m[2] || '/'
  end
  from (select regexp_match(p_url,
          '^https://(?:www\.)?instagram\.com/(?:[A-Za-z0-9._]+/)?(p|reel|reels|tv)/([A-Za-z0-9_-]+)') as m) x;
$$;

create function public.submissions_before_write()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid    uuid := auth.uid();
  v_collab public.collaborations;
begin
  if tg_op = 'INSERT' then
    select * into v_collab from public.collaborations where id = new.collaboration_id;
    if not found then
      raise exception 'collaboration not found' using errcode = '23503';
    end if;
    new.creator_id := v_collab.creator_id;
    new.brand_id   := v_collab.brand_id;
    new.status      := 'pending';
    new.feedback    := null;
    new.reviewed_at := null;

    if v_uid is not null and v_uid <> v_collab.creator_id then
      raise exception 'only the creator can submit content' using errcode = '42501';
    end if;
    if exists (select 1 from public.collaboration_submissions
                where collaboration_id = new.collaboration_id and status = 'pending') then
      raise exception 'your last submission is still waiting for review' using errcode = '42501';
    end if;

    if new.kind = 'draft' then
      if v_collab.status not in ('accepted', 'in_progress') then
        raise exception 'drafts can be submitted once the collaboration is accepted'
          using errcode = '42501';
      end if;
    else
      if v_collab.status <> 'in_progress' or not exists (
           select 1 from public.collaboration_submissions
            where collaboration_id = new.collaboration_id
              and kind = 'draft' and status = 'approved') then
        raise exception 'post live only after the brand approves your draft'
          using errcode = '42501';
      end if;
      new.content_url := public.instagram_permalink(new.content_url);
      if new.content_url is null then
        raise exception 'enter the link to your Instagram post or reel' using errcode = '22023';
      end if;
      select m.id into new.ig_media_id
        from public.instagram_media m
        join public.instagram_accounts a on a.id = m.account_id
       where a.creator_id = v_collab.creator_id
         and public.instagram_permalink(m.permalink) = new.content_url
       limit 1;
    end if;
    return new;
  end if;

  -- UPDATE: only the review outcome may change.
  if new.collaboration_id <> old.collaboration_id or new.kind <> old.kind
     or new.content_url <> old.content_url
     or new.caption is distinct from old.caption
     or new.notes is distinct from old.notes then
    raise exception 'submissions cannot be edited; submit a new one' using errcode = '42501';
  end if;
  if v_uid is not null and new.status is distinct from old.status then
    if old.status <> 'pending' or new.status = 'pending' then
      raise exception 'this submission has already been reviewed' using errcode = '42501';
    end if;
    if new.status = 'changes_requested' and coalesce(trim(new.feedback), '') = '' then
      raise exception 'tell the creator what to change' using errcode = '22023';
    end if;
  end if;
  if new.status is distinct from old.status then
    new.reviewed_at := now();
  end if;
  return new;
end;
$$;

create trigger submissions_before_write
  before insert or update on public.collaboration_submissions
  for each row execute function public.submissions_before_write();

-- Moves the collaboration along as content is submitted and reviewed. Runs
-- with the caller's identity, so collaborations_guard still applies.
create function public.submissions_after_write()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_status public.collaboration_status;
begin
  select status into v_status from public.collaborations where id = new.collaboration_id;

  if tg_op = 'INSERT' then
    if new.kind = 'draft' and v_status = 'accepted' then
      update public.collaborations set status = 'in_progress' where id = new.collaboration_id;
    elsif new.kind = 'live' and v_status = 'in_progress' then
      update public.collaborations set status = 'awaiting_approval' where id = new.collaboration_id;
    end if;
  elsif new.kind = 'live' and new.status is distinct from old.status then
    if new.status = 'approved' and v_status = 'awaiting_approval' then
      update public.collaborations set status = 'completed' where id = new.collaboration_id;
    elsif new.status = 'changes_requested' and v_status = 'awaiting_approval' then
      update public.collaborations set status = 'in_progress' where id = new.collaboration_id;
    end if;
  end if;
  return null;
end;
$$;

create trigger submissions_after_write
  after insert or update on public.collaboration_submissions
  for each row execute function public.submissions_after_write();

revoke all on public.collaboration_submissions from anon, authenticated;
grant select on public.collaboration_submissions to authenticated;
grant insert (collaboration_id, kind, content_url, caption, notes)
  on public.collaboration_submissions to authenticated;
grant update (status, feedback) on public.collaboration_submissions to authenticated;

alter table public.collaboration_submissions enable row level security;

create policy "submissions are visible to both parties"
  on public.collaboration_submissions for select to authenticated
  using ((select auth.uid()) in (creator_id, brand_id));
create policy "creators submit content"
  on public.collaboration_submissions for insert to authenticated
  with check (creator_id = (select auth.uid()));
create policy "brands review submissions"
  on public.collaboration_submissions for update to authenticated
  using (brand_id = (select auth.uid())) with check (brand_id = (select auth.uid()));

-------------------------------------------------------------------------------
-- Campaign reporting: live post insights, shared with the brand by consent
-------------------------------------------------------------------------------

-- Submitting a live post for a campaign shares that post's insights (and
-- only that post's) with the campaign's brand. The creator is told this in
-- the app before submitting. Disconnecting Instagram removes the data.
create function public.campaign_live_posts(p_campaign_id uuid)
returns table (
  collaboration_id     uuid,
  creator_id           uuid,
  submission_id        uuid,
  content_url          text,
  submission_status    public.submission_status,
  submitted_at         timestamptz,
  matched              boolean,
  posted_at            timestamptz,
  like_count           integer,
  comments_count       integer,
  reach                integer,
  views                integer,
  saved                integer,
  shares               integer,
  total_interactions   integer,
  insights_updated_at  timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select distinct on (s.collaboration_id)
         s.collaboration_id, s.creator_id, s.id, s.content_url, s.status, s.created_at,
         m.id is not null, m.posted_at, m.like_count, m.comments_count, m.reach, m.views,
         m.saved, m.shares, m.total_interactions, m.insights_updated_at
    from public.collaboration_submissions s
    join public.collaborations c on c.id = s.collaboration_id
    left join public.instagram_media m on m.id = s.ig_media_id
   where c.campaign_id = p_campaign_id
     and s.kind = 'live'
     and s.status <> 'changes_requested'
     and (c.brand_id = (select auth.uid()) or c.creator_id = (select auth.uid()))
   order by s.collaboration_id, s.created_at desc;
$$;

revoke execute on function public.campaign_live_posts(uuid) from public, anon;
grant execute on function public.campaign_live_posts(uuid) to authenticated;
revoke execute on function public.instagram_permalink(text) from anon;

-------------------------------------------------------------------------------
-- Creator directory for brand discovery
-------------------------------------------------------------------------------

-- Only public information: name, bio, niches, city, rates, and Instagram
-- handle / followers / engagement (verified when synced from Instagram).
create view public.creator_directory
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
  p.created_at
from public.profiles p
join public.creator_profiles cp on cp.id = p.id
left join public.social_accounts sa on sa.creator_id = p.id and sa.platform = 'instagram';

revoke all on public.creator_directory from anon;
grant select on public.creator_directory to authenticated;
