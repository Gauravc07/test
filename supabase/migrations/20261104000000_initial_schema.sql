-- Shor initial schema: creators, brands, campaigns, collaborations,
-- shortlists, invoices, transactions and messaging.
--
-- Security model
--   * Every table has row level security on. The anon role gets nothing;
--     signed-in users (authenticated) only see and change their own rows.
--   * Columns users must not set themselves (role, verified, spend,
--     metrics, invoice amounts after creation, ...) are protected with
--     column-level grants. Triggers derive ownership columns and enforce
--     allowed status changes.
--   * Payments (transactions, invoice "paid") are written only by the
--     service role from trusted server code.
--   * A profile is created automatically when someone signs up. Pass
--     role ('creator' | 'brand'), full_name and, for brands, company_name
--     in the sign-up metadata (options.data / data:).

-------------------------------------------------------------------------------
-- Types
-------------------------------------------------------------------------------

create type public.user_role as enum ('creator', 'brand');

create type public.platform as enum
  ('instagram', 'youtube', 'tiktok', 'twitter', 'facebook', 'linkedin');

create type public.campaign_status as enum
  ('draft', 'active', 'paused', 'completed', 'archived');

create type public.campaign_objective as enum
  ('brand_awareness', 'conversions', 'engagement', 'reach', 'traffic', 'app_installs');

create type public.priority_level as enum ('low', 'medium', 'high', 'urgent');

create type public.collaboration_status as enum
  ('invited', 'applied', 'accepted', 'declined', 'in_progress',
   'awaiting_approval', 'completed', 'cancelled');

create type public.invoice_status as enum ('pending', 'approved', 'rejected', 'paid');

create type public.transaction_type as enum ('payout', 'refund', 'deposit', 'withdrawal');

create type public.transaction_status as enum ('pending', 'completed', 'failed');

-------------------------------------------------------------------------------
-- Shared helpers
-------------------------------------------------------------------------------

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- Share of each invoice kept by Shor.
create function public.platform_fee_rate()
returns numeric
language sql
immutable
set search_path = ''
as $$ select 0.10::numeric $$;

-------------------------------------------------------------------------------
-- Accounts
-------------------------------------------------------------------------------

create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  role        public.user_role not null,
  full_name   text not null default '' check (char_length(full_name) <= 120),
  avatar_url  text,
  verified    boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (id, role)
);

-- (id, role) foreign keys guarantee a brand row always belongs to a brand
-- account and a creator row to a creator account.
create table public.brand_profiles (
  id            uuid primary key,
  role          public.user_role not null default 'brand' check (role = 'brand'),
  company_name  text not null check (char_length(company_name) between 1 and 160),
  website       text,
  industry      text,
  description   text check (char_length(description) <= 2000),
  logo_url      text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  foreign key (id, role) references public.profiles (id, role) on delete cascade
);

create table public.creator_profiles (
  id          uuid primary key,
  role        public.user_role not null default 'creator' check (role = 'creator'),
  handle      text check (handle ~ '^[A-Za-z0-9._]{2,30}$'),
  bio         text check (char_length(bio) <= 1000),
  niches      text[] not null default '{}',
  location    text,
  rate_min    numeric(12, 2) check (rate_min >= 0),
  rate_max    numeric(12, 2) check (rate_max >= 0),
  currency    char(3) not null default 'INR' check (currency ~ '^[A-Z]{3}$'),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  check (rate_min is null or rate_max is null or rate_max >= rate_min),
  foreign key (id, role) references public.profiles (id, role) on delete cascade
);

create unique index creator_profiles_handle_key on public.creator_profiles (lower(handle));

create table public.social_accounts (
  id               uuid primary key default gen_random_uuid(),
  creator_id       uuid not null references public.creator_profiles (id) on delete cascade,
  platform         public.platform not null,
  handle           text not null check (char_length(handle) between 1 and 100),
  profile_url      text,
  followers        integer not null default 0 check (followers >= 0),
  engagement_rate  numeric(5, 2) check (engagement_rate between 0 and 100),
  avg_views        integer check (avg_views >= 0),
  verified         boolean not null default false,
  last_synced_at   timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (creator_id, platform)
);

-------------------------------------------------------------------------------
-- Campaigns and collaborations
-------------------------------------------------------------------------------

create table public.campaigns (
  id                uuid primary key default gen_random_uuid(),
  brand_id          uuid not null references public.brand_profiles (id) on delete cascade,
  title             text not null check (char_length(title) between 1 and 200),
  description       text check (char_length(description) <= 5000),
  status            public.campaign_status not null default 'draft',
  objective         public.campaign_objective not null,
  priority          public.priority_level not null default 'medium',
  niche             text,
  tags              text[] not null default '{}',
  platforms         public.platform[] not null default '{}',
  -- e.g. {"reels": 3, "stories": 5}
  deliverables      jsonb not null default '{}' check (jsonb_typeof(deliverables) = 'object'),
  -- e.g. {"age_range": "18-34", "location": ["IN"], "interests": ["fitness"]}
  target_audience   jsonb not null default '{}' check (jsonb_typeof(target_audience) = 'object'),
  budget            numeric(14, 2) not null check (budget >= 0),
  currency          char(3) not null default 'INR' check (currency ~ '^[A-Z]{3}$'),
  start_date        date,
  end_date          date,
  thumbnail_url     text,
  -- Maintained by server code, not by users.
  spend             numeric(14, 2) not null default 0 check (spend >= 0),
  reach             bigint not null default 0 check (reach >= 0),
  impressions       bigint not null default 0 check (impressions >= 0),
  engagement_count  bigint not null default 0 check (engagement_count >= 0),
  clicks            bigint not null default 0 check (clicks >= 0),
  conversions       bigint not null default 0 check (conversions >= 0),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  check (end_date is null or start_date is null or end_date >= start_date)
);

create index campaigns_brand_id_idx on public.campaigns (brand_id);
create index campaigns_status_idx on public.campaigns (status);
create index campaigns_platforms_idx on public.campaigns using gin (platforms);

-- One row per creator per campaign, covering the whole lifecycle from
-- invite/application to completion.
create table public.collaborations (
  id             uuid primary key default gen_random_uuid(),
  campaign_id    uuid not null references public.campaigns (id) on delete cascade,
  creator_id     uuid not null references public.creator_profiles (id) on delete cascade,
  brand_id       uuid not null references public.brand_profiles (id) on delete cascade, -- copied from campaign
  status         public.collaboration_status not null,
  pitch          text check (char_length(pitch) <= 3000),
  agreed_amount  numeric(14, 2) check (agreed_amount >= 0),
  currency       char(3) not null default 'INR' check (currency ~ '^[A-Z]{3}$'),
  deliverables   jsonb not null default '{}' check (jsonb_typeof(deliverables) = 'object'),
  due_date       date,
  content_urls   text[] not null default '{}',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (campaign_id, creator_id)
);

create index collaborations_creator_id_idx on public.collaborations (creator_id);
create index collaborations_brand_id_idx on public.collaborations (brand_id);

create function public.collaborations_guard()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid      uuid := auth.uid();  -- null for service role / direct SQL
  v_campaign public.campaigns;
  v_move     text;
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
        if v_campaign.status <> 'active' then
          raise exception 'this campaign is not accepting applications' using errcode = '42501';
        end if;
      elsif v_uid = new.brand_id then
        if new.status <> 'invited' then
          raise exception 'brands start a collaboration by inviting' using errcode = '42501';
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
  end if;

  return new;
end;
$$;

create trigger collaborations_guard
  before insert or update on public.collaborations
  for each row execute function public.collaborations_guard();

-------------------------------------------------------------------------------
-- Shortlists (brand-private lists of creators)
-------------------------------------------------------------------------------

create table public.shortlists (
  id          uuid primary key default gen_random_uuid(),
  brand_id    uuid not null default auth.uid() references public.brand_profiles (id) on delete cascade,
  name        text not null check (char_length(name) between 1 and 120),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (brand_id, name)
);

create table public.shortlist_items (
  shortlist_id  uuid not null references public.shortlists (id) on delete cascade,
  creator_id    uuid not null references public.creator_profiles (id) on delete cascade,
  campaign_id   uuid references public.campaigns (id) on delete set null,
  notes         text check (char_length(notes) <= 2000),
  starred       boolean not null default false,
  rating        smallint check (rating between 1 and 5),
  tags          text[] not null default '{}',
  added_at      timestamptz not null default now(),
  primary key (shortlist_id, creator_id)
);

create index shortlist_items_creator_id_idx on public.shortlist_items (creator_id);
create index shortlist_items_campaign_id_idx on public.shortlist_items (campaign_id);

-------------------------------------------------------------------------------
-- Invoices and transactions
-------------------------------------------------------------------------------

create sequence public.invoice_number_seq;
create sequence public.transaction_number_seq;

-- Financial records use ON DELETE RESTRICT: an account or campaign with
-- invoices cannot be deleted until those records are dealt with.
create table public.invoices (
  id                uuid primary key default gen_random_uuid(),
  invoice_number    text not null unique default
                      ('INV-' || to_char(now(), 'YYYY') || '-' ||
                       lpad(nextval('public.invoice_number_seq')::text, 5, '0')),
  collaboration_id  uuid not null references public.collaborations (id) on delete restrict,
  brand_id          uuid not null references public.brand_profiles (id) on delete restrict,   -- copied
  creator_id        uuid not null references public.creator_profiles (id) on delete restrict, -- copied
  description       text check (char_length(description) <= 1000),  -- e.g. "3 Instagram posts + 5 stories"
  gross_amount      numeric(14, 2) not null check (gross_amount > 0),
  platform_fee      numeric(14, 2) not null default 0 check (platform_fee >= 0),
  net_amount        numeric(14, 2) generated always as (gross_amount - platform_fee) stored,
  currency          char(3) not null default 'INR' check (currency ~ '^[A-Z]{3}$'),
  status            public.invoice_status not null default 'pending',
  due_date          date,
  decided_at        timestamptz,
  paid_at           timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  check (platform_fee <= gross_amount)
);

create index invoices_collaboration_id_idx on public.invoices (collaboration_id);
create index invoices_brand_id_idx on public.invoices (brand_id, status);
create index invoices_creator_id_idx on public.invoices (creator_id, status);

create function public.invoices_guard()
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
      raise exception 'collaboration % not found', new.collaboration_id using errcode = '23503';
    end if;
    new.brand_id   := v_collab.brand_id;
    new.creator_id := v_collab.creator_id;
    new.currency   := v_collab.currency;

    if v_uid is not null then
      if v_uid <> v_collab.creator_id then
        raise exception 'only the creator on this collaboration can raise an invoice'
          using errcode = '42501';
      end if;
      if v_collab.status not in ('accepted', 'in_progress', 'awaiting_approval', 'completed') then
        raise exception 'invoices can only be raised on an accepted collaboration'
          using errcode = '42501';
      end if;
      new.status     := 'pending';
      new.decided_at := null;
      new.paid_at    := null;
    end if;
  else
    if new.collaboration_id <> old.collaboration_id
       or new.brand_id <> old.brand_id
       or new.creator_id <> old.creator_id then
      raise exception 'an invoice cannot be moved to another collaboration' using errcode = '42501';
    end if;

    if new.status is distinct from old.status then
      if v_uid is not null and not (old.status = 'pending' and new.status in ('approved', 'rejected')) then
        raise exception 'invoice status change %>% is not allowed', old.status, new.status
          using errcode = '42501';
      end if;
      if new.status in ('approved', 'rejected') then
        new.decided_at := now();
      elsif new.status = 'paid' then
        new.paid_at := coalesce(new.paid_at, now());
      end if;
    end if;
  end if;

  new.platform_fee := round(new.gross_amount * public.platform_fee_rate(), 2);
  return new;
end;
$$;

create trigger invoices_guard
  before insert or update on public.invoices
  for each row execute function public.invoices_guard();

create table public.transactions (
  id                  uuid primary key default gen_random_uuid(),
  reference           text not null unique default
                        ('TXN-' || to_char(now(), 'YYYY') || '-' ||
                         lpad(nextval('public.transaction_number_seq')::text, 5, '0')),
  invoice_id          uuid references public.invoices (id) on delete restrict,
  brand_id            uuid references public.brand_profiles (id) on delete restrict,
  creator_id          uuid references public.creator_profiles (id) on delete restrict,
  type                public.transaction_type not null,
  amount              numeric(14, 2) not null check (amount > 0),
  currency            char(3) not null default 'INR' check (currency ~ '^[A-Z]{3}$'),
  status              public.transaction_status not null default 'pending',
  payment_method      text,   -- display only, e.g. "UPI - alex***@upi"; never store full details
  provider_reference  text,
  failure_reason      text,
  created_at          timestamptz not null default now(),
  completed_at        timestamptz,
  check (brand_id is not null or creator_id is not null)
);

create index transactions_invoice_id_idx on public.transactions (invoice_id);
create index transactions_brand_id_idx on public.transactions (brand_id, created_at desc);
create index transactions_creator_id_idx on public.transactions (creator_id, created_at desc);

-------------------------------------------------------------------------------
-- Messaging
-------------------------------------------------------------------------------

create table public.conversations (
  id               uuid primary key default gen_random_uuid(),
  brand_id         uuid not null references public.brand_profiles (id) on delete cascade,
  creator_id       uuid not null references public.creator_profiles (id) on delete cascade,
  campaign_id      uuid references public.campaigns (id) on delete set null,
  created_at       timestamptz not null default now(),
  last_message_at  timestamptz,
  unique nulls not distinct (brand_id, creator_id, campaign_id)
);

create index conversations_creator_id_idx on public.conversations (creator_id, last_message_at desc);
create index conversations_brand_last_idx on public.conversations (brand_id, last_message_at desc);
create index conversations_campaign_id_idx on public.conversations (campaign_id);

create table public.messages (
  id               uuid primary key default gen_random_uuid(),
  conversation_id  uuid not null references public.conversations (id) on delete cascade,
  sender_id        uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  body             text not null check (char_length(body) between 1 and 5000),
  created_at       timestamptz not null default now(),
  read_at          timestamptz
);

create index messages_conversation_created_idx on public.messages (conversation_id, created_at desc);
create index messages_sender_id_idx on public.messages (sender_id);

create function public.messages_touch_conversation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.conversations
     set last_message_at = new.created_at
   where id = new.conversation_id;
  return null;
end;
$$;

create trigger messages_touch_conversation
  after insert on public.messages
  for each row execute function public.messages_touch_conversation();

-------------------------------------------------------------------------------
-- updated_at triggers
-------------------------------------------------------------------------------

create trigger set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.brand_profiles
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.creator_profiles
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.social_accounts
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.campaigns
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.collaborations
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.shortlists
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.invoices
  for each row execute function public.set_updated_at();

-------------------------------------------------------------------------------
-- Profile creation on sign-up
-------------------------------------------------------------------------------

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  v_role public.user_role :=
    case v_meta ->> 'role' when 'brand' then 'brand'::public.user_role
                           else 'creator'::public.user_role end;
  v_name text := left(trim(coalesce(v_meta ->> 'full_name', v_meta ->> 'name', '')), 120);
begin
  insert into public.profiles (id, role, full_name, avatar_url)
  values (new.id, v_role, v_name, v_meta ->> 'avatar_url');

  if v_role = 'brand' then
    insert into public.brand_profiles (id, company_name)
    values (new.id, left(coalesce(nullif(trim(v_meta ->> 'company_name'), ''),
                                  nullif(v_name, ''),
                                  nullif(split_part(new.email, '@', 1), ''),
                                  'My brand'), 160));
  else
    insert into public.creator_profiles (id) values (new.id);
  end if;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-------------------------------------------------------------------------------
-- Privileges
-------------------------------------------------------------------------------

-- Nothing for signed-out visitors.
revoke all on all tables in schema public from anon;
revoke all on all sequences in schema public from anon;
revoke execute on all functions in schema public from anon, public;
grant execute on function public.platform_fee_rate() to authenticated, service_role;

-- Column-level grants for signed-in users. Anything not listed is read-only.
revoke insert, update, delete on public.profiles from authenticated;
grant update (full_name, avatar_url) on public.profiles to authenticated;

revoke insert, update, delete on public.brand_profiles from authenticated;
grant update (company_name, website, industry, description, logo_url)
  on public.brand_profiles to authenticated;

revoke insert, update, delete on public.creator_profiles from authenticated;
grant update (handle, bio, niches, location, rate_min, rate_max, currency)
  on public.creator_profiles to authenticated;

revoke insert, update on public.social_accounts from authenticated;
grant insert (creator_id, platform, handle, profile_url, followers, engagement_rate, avg_views)
  on public.social_accounts to authenticated;
grant update (handle, profile_url, followers, engagement_rate, avg_views)
  on public.social_accounts to authenticated;

revoke insert, update on public.campaigns from authenticated;
grant insert (brand_id, title, description, status, objective, priority, niche, tags,
              platforms, deliverables, target_audience, budget, currency, start_date,
              end_date, thumbnail_url)
  on public.campaigns to authenticated;
grant update (title, description, status, objective, priority, niche, tags, platforms,
              deliverables, target_audience, budget, currency, start_date, end_date,
              thumbnail_url)
  on public.campaigns to authenticated;

revoke insert, update, delete on public.collaborations from authenticated;
grant insert (campaign_id, creator_id, status, pitch, agreed_amount, deliverables, due_date)
  on public.collaborations to authenticated;
grant update (status, pitch, agreed_amount, deliverables, due_date, content_urls)
  on public.collaborations to authenticated;

revoke insert, update, delete on public.invoices from authenticated;
grant insert (collaboration_id, description, gross_amount, due_date)
  on public.invoices to authenticated;
grant update (status) on public.invoices to authenticated;

revoke insert, update, delete on public.transactions from authenticated;

revoke update, delete on public.conversations from authenticated;

revoke insert, update, delete on public.messages from authenticated;
grant insert (conversation_id, sender_id, body) on public.messages to authenticated;
grant update (read_at) on public.messages to authenticated;

-------------------------------------------------------------------------------
-- Row level security
-------------------------------------------------------------------------------

alter table public.profiles         enable row level security;
alter table public.brand_profiles   enable row level security;
alter table public.creator_profiles enable row level security;
alter table public.social_accounts  enable row level security;
alter table public.campaigns        enable row level security;
alter table public.collaborations   enable row level security;
alter table public.shortlists       enable row level security;
alter table public.shortlist_items  enable row level security;
alter table public.invoices         enable row level security;
alter table public.transactions     enable row level security;
alter table public.conversations    enable row level security;
alter table public.messages         enable row level security;

-- Public directory: any signed-in user can browse profiles.
create policy "profiles are visible to signed-in users"
  on public.profiles for select to authenticated using (true);
create policy "users update their own profile"
  on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy "brand profiles are visible to signed-in users"
  on public.brand_profiles for select to authenticated using (true);
create policy "brands update their own brand profile"
  on public.brand_profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy "creator profiles are visible to signed-in users"
  on public.creator_profiles for select to authenticated using (true);
create policy "creators update their own creator profile"
  on public.creator_profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy "social accounts are visible to signed-in users"
  on public.social_accounts for select to authenticated using (true);
create policy "creators add their own social accounts"
  on public.social_accounts for insert to authenticated
  with check (creator_id = (select auth.uid()));
create policy "creators update their own social accounts"
  on public.social_accounts for update to authenticated
  using (creator_id = (select auth.uid())) with check (creator_id = (select auth.uid()));
create policy "creators remove their own social accounts"
  on public.social_accounts for delete to authenticated
  using (creator_id = (select auth.uid()));

-- Campaigns: brands see all of their own; everyone sees live ones;
-- creators also keep seeing campaigns they are part of.
create policy "campaigns are visible to their brand, when live, or to collaborators"
  on public.campaigns for select to authenticated
  using (
    brand_id = (select auth.uid())
    or status in ('active', 'paused', 'completed')
    or exists (select 1 from public.collaborations c
                where c.campaign_id = campaigns.id
                  and c.creator_id = (select auth.uid()))
  );
create policy "brands create their own campaigns"
  on public.campaigns for insert to authenticated
  with check (brand_id = (select auth.uid()));
create policy "brands update their own campaigns"
  on public.campaigns for update to authenticated
  using (brand_id = (select auth.uid())) with check (brand_id = (select auth.uid()));
create policy "brands delete their own campaigns"
  on public.campaigns for delete to authenticated
  using (brand_id = (select auth.uid()));

create policy "collaborations are visible to both parties"
  on public.collaborations for select to authenticated
  using ((select auth.uid()) in (brand_id, creator_id));
create policy "creators apply or brands invite"
  on public.collaborations for insert to authenticated
  with check ((select auth.uid()) in (brand_id, creator_id));
create policy "both parties update a collaboration"
  on public.collaborations for update to authenticated
  using ((select auth.uid()) in (brand_id, creator_id))
  with check ((select auth.uid()) in (brand_id, creator_id));

create policy "brands manage their own shortlists"
  on public.shortlists for all to authenticated
  using (brand_id = (select auth.uid())) with check (brand_id = (select auth.uid()));

create policy "brands manage items in their own shortlists"
  on public.shortlist_items for all to authenticated
  using (exists (select 1 from public.shortlists s
                  where s.id = shortlist_items.shortlist_id
                    and s.brand_id = (select auth.uid())))
  with check (exists (select 1 from public.shortlists s
                       where s.id = shortlist_items.shortlist_id
                         and s.brand_id = (select auth.uid())));

create policy "invoices are visible to both parties"
  on public.invoices for select to authenticated
  using ((select auth.uid()) in (brand_id, creator_id));
create policy "creators raise invoices"
  on public.invoices for insert to authenticated
  with check (creator_id = (select auth.uid()));
create policy "brands approve or reject invoices"
  on public.invoices for update to authenticated
  using (brand_id = (select auth.uid())) with check (brand_id = (select auth.uid()));

create policy "transactions are visible to the parties"
  on public.transactions for select to authenticated
  using ((select auth.uid()) in (brand_id, creator_id));

create policy "conversations are visible to participants"
  on public.conversations for select to authenticated
  using ((select auth.uid()) in (brand_id, creator_id));
create policy "participants start conversations"
  on public.conversations for insert to authenticated
  with check ((select auth.uid()) in (brand_id, creator_id));

create policy "messages are visible to participants"
  on public.messages for select to authenticated
  using (exists (select 1 from public.conversations c
                  where c.id = messages.conversation_id
                    and (select auth.uid()) in (c.brand_id, c.creator_id)));
create policy "participants send messages as themselves"
  on public.messages for insert to authenticated
  with check (
    sender_id = (select auth.uid())
    and exists (select 1 from public.conversations c
                 where c.id = messages.conversation_id
                   and (select auth.uid()) in (c.brand_id, c.creator_id)));
create policy "recipients mark messages read"
  on public.messages for update to authenticated
  using (
    sender_id <> (select auth.uid())
    and exists (select 1 from public.conversations c
                 where c.id = messages.conversation_id
                   and (select auth.uid()) in (c.brand_id, c.creator_id)));

-------------------------------------------------------------------------------
-- Realtime: stream new messages to the chat screen.
-------------------------------------------------------------------------------

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table public.messages;
  end if;
end;
$$;
