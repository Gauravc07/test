-- Instagram insights for creators (Instagram API with Instagram Login).
--
-- Security model
--   * Access tokens never touch a table the app can read. They are encrypted
--     in Supabase Vault; only the service role (Edge Functions) can store or
--     read them, through the ig_* functions below.
--   * Profile, insights, posts and audience data are readable only by the
--     creator who connected the account. Nobody can write them from the app:
--     only the sync Edge Function (service role) does.
--   * Disconnecting, deleting the Shor account, or a Meta deauthorize /
--     data-deletion callback deletes the account row, which cascades to every
--     Instagram table and removes the token from Vault.
--   * Brands see only what is already public on Instagram (handle, follower
--     count, engagement from public like/comment counts), mirrored into
--     social_accounts with verified = true.

-------------------------------------------------------------------------------
-- Connected accounts
-------------------------------------------------------------------------------

create table public.instagram_accounts (
  id                   uuid primary key default gen_random_uuid(),
  creator_id           uuid not null unique references public.creator_profiles (id) on delete cascade,
  -- Instagram-scoped user ID returned by the token exchange (matches the
  -- user_id Meta sends to the deauthorize / data-deletion callbacks).
  ig_user_id           text not null unique,
  -- Professional account ID returned by /me (used for Graph calls).
  ig_account_id        text,
  username             text not null,
  name                 text,
  account_type         text,               -- BUSINESS or MEDIA_CREATOR
  profile_picture_url  text,
  biography            text,
  website              text,
  followers_count      integer,
  follows_count        integer,
  media_count          integer,
  granted_scopes       text[] not null default '{}',
  status               text not null default 'active'
                         check (status in ('active', 'needs_reauth')),
  token_expires_at     timestamptz,
  connected_at         timestamptz not null default now(),
  last_synced_at       timestamptz,
  sync_started_at      timestamptz,
  last_sync_error      text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create trigger set_updated_at before update on public.instagram_accounts
  for each row execute function public.set_updated_at();

-- Daily account metrics, one row per day (UTC).
create table public.instagram_daily_metrics (
  account_id          uuid not null references public.instagram_accounts (id) on delete cascade,
  metric_date         date not null,
  reach               integer,
  views               integer,
  accounts_engaged    integer,
  total_interactions  integer,
  likes               integer,
  comments            integer,
  shares              integer,
  saves               integer,
  replies             integer,
  profile_links_taps  integer,
  fetched_at          timestamptz not null default now(),
  primary key (account_id, metric_date)
);

-- Daily snapshot of public counts, so follower growth can be charted.
create table public.instagram_account_snapshots (
  account_id       uuid not null references public.instagram_accounts (id) on delete cascade,
  captured_on      date not null,
  followers_count  integer,
  follows_count    integer,
  media_count      integer,
  primary key (account_id, captured_on)
);

-- Recent posts and reels with their insights.
create table public.instagram_media (
  id                   text primary key,   -- Instagram media ID
  account_id           uuid not null references public.instagram_accounts (id) on delete cascade,
  media_type           text,               -- IMAGE, VIDEO, CAROUSEL_ALBUM
  media_product_type   text,               -- FEED, REELS, STORY
  caption              text,
  permalink            text,
  thumbnail_url        text,
  media_url            text,
  posted_at            timestamptz,
  like_count           integer,
  comments_count       integer,
  reach                integer,
  views                integer,
  saved                integer,
  shares               integer,
  total_interactions   integer,
  insights_updated_at  timestamptz
);

create index instagram_media_account_posted_idx
  on public.instagram_media (account_id, posted_at desc);

-- Follower demographics (top values per breakdown, replaced on each sync).
create table public.instagram_audience (
  account_id   uuid not null references public.instagram_accounts (id) on delete cascade,
  breakdown    text not null check (breakdown in ('age', 'gender', 'country', 'city')),
  dimension    text not null,
  value        integer not null,
  captured_at  timestamptz not null default now(),
  primary key (account_id, breakdown, dimension)
);

-------------------------------------------------------------------------------
-- Server-only tables (no grants, RLS on with no policies)
-------------------------------------------------------------------------------

-- Pointer from an account to its encrypted token in Vault.
create table public.instagram_tokens (
  account_id       uuid primary key references public.instagram_accounts (id) on delete cascade,
  vault_secret_id  uuid not null,
  issued_at        timestamptz not null default now(),
  expires_at       timestamptz
);

-- One-time OAuth "state" values (CSRF protection), valid for 10 minutes.
create table public.instagram_oauth_states (
  state       text primary key,
  creator_id  uuid not null references public.creator_profiles (id) on delete cascade,
  return_to   text not null,
  created_at  timestamptz not null default now(),
  expires_at  timestamptz not null default now() + interval '10 minutes'
);

-- Deletion requests from Meta, kept so the status page can answer.
-- Holds no Instagram data beyond the scoped ID.
create table public.instagram_deletion_requests (
  confirmation_code  text primary key,
  ig_user_id         text not null,
  requested_at       timestamptz not null default now(),
  completed_at       timestamptz,
  matched_account    boolean not null default false
);

-- Removing a token row also destroys the encrypted secret.
create function public.instagram_tokens_purge_secret()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from vault.secrets where id = old.vault_secret_id;
  return old;
end;
$$;

create trigger instagram_tokens_purge_secret
  after delete on public.instagram_tokens
  for each row execute function public.instagram_tokens_purge_secret();

-------------------------------------------------------------------------------
-- Token helpers (service role only)
-------------------------------------------------------------------------------

create function public.ig_save_token(p_account_id uuid, p_token text, p_expires_at timestamptz)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_secret uuid;
begin
  select vault_secret_id into v_secret
    from public.instagram_tokens where account_id = p_account_id;

  if v_secret is null then
    v_secret := vault.create_secret(p_token, 'instagram_token_' || p_account_id::text,
                                    'Instagram long-lived access token');
    insert into public.instagram_tokens (account_id, vault_secret_id, issued_at, expires_at)
    values (p_account_id, v_secret, now(), p_expires_at);
  else
    perform vault.update_secret(v_secret, p_token);
    update public.instagram_tokens
       set issued_at = now(), expires_at = p_expires_at
     where account_id = p_account_id;
  end if;

  update public.instagram_accounts
     set token_expires_at = p_expires_at, status = 'active'
   where id = p_account_id;
end;
$$;

create function public.ig_get_token(p_account_id uuid)
returns table (access_token text, issued_at timestamptz, expires_at timestamptz)
language sql
security definer
set search_path = ''
as $$
  select s.decrypted_secret, t.issued_at, t.expires_at
    from public.instagram_tokens t
    join vault.decrypted_secrets s on s.id = t.vault_secret_id
   where t.account_id = p_account_id;
$$;

-- Atomically consumes an OAuth state; returns nothing if unknown or expired.
create function public.ig_consume_oauth_state(p_state text)
returns table (creator_id uuid, return_to text)
language sql
security definer
set search_path = ''
as $$
  with consumed as (
    delete from public.instagram_oauth_states
     where state = p_state
    returning creator_id, return_to, expires_at
  )
  select creator_id, return_to from consumed where expires_at > now();
$$;

-- Deletes everything we hold for an Instagram user (deauthorize, data
-- deletion request, or disconnect). Returns true if an account matched.
create function public.ig_delete_by_ig_user(p_ig_user_id text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_creator uuid;
begin
  delete from public.instagram_accounts
   where ig_user_id = p_ig_user_id or ig_account_id = p_ig_user_id
  returning creator_id into v_creator;

  if v_creator is null then
    return false;
  end if;

  delete from public.social_accounts
   where creator_id = v_creator and platform = 'instagram';
  return true;
end;
$$;

-------------------------------------------------------------------------------
-- Privileges and row level security
-------------------------------------------------------------------------------

revoke all on public.instagram_accounts, public.instagram_daily_metrics,
              public.instagram_account_snapshots, public.instagram_media,
              public.instagram_audience
  from anon, authenticated;
grant select on public.instagram_accounts, public.instagram_daily_metrics,
                public.instagram_account_snapshots, public.instagram_media,
                public.instagram_audience
  to authenticated;

revoke all on public.instagram_tokens, public.instagram_oauth_states,
              public.instagram_deletion_requests
  from anon, authenticated;

revoke execute on function public.ig_save_token(uuid, text, timestamptz),
                           public.ig_get_token(uuid),
                           public.ig_consume_oauth_state(text),
                           public.ig_delete_by_ig_user(text),
                           public.instagram_tokens_purge_secret()
  from public, anon, authenticated;
grant execute on function public.ig_save_token(uuid, text, timestamptz),
                          public.ig_get_token(uuid),
                          public.ig_consume_oauth_state(text),
                          public.ig_delete_by_ig_user(text)
  to service_role;

alter table public.instagram_accounts          enable row level security;
alter table public.instagram_daily_metrics     enable row level security;
alter table public.instagram_account_snapshots enable row level security;
alter table public.instagram_media             enable row level security;
alter table public.instagram_audience          enable row level security;
alter table public.instagram_tokens            enable row level security;
alter table public.instagram_oauth_states      enable row level security;
alter table public.instagram_deletion_requests enable row level security;

create policy "creators see their own Instagram account"
  on public.instagram_accounts for select to authenticated
  using (creator_id = (select auth.uid()));

create policy "creators see their own daily metrics"
  on public.instagram_daily_metrics for select to authenticated
  using (exists (select 1 from public.instagram_accounts a
                  where a.id = instagram_daily_metrics.account_id
                    and a.creator_id = (select auth.uid())));

create policy "creators see their own snapshots"
  on public.instagram_account_snapshots for select to authenticated
  using (exists (select 1 from public.instagram_accounts a
                  where a.id = instagram_account_snapshots.account_id
                    and a.creator_id = (select auth.uid())));

create policy "creators see their own media"
  on public.instagram_media for select to authenticated
  using (exists (select 1 from public.instagram_accounts a
                  where a.id = instagram_media.account_id
                    and a.creator_id = (select auth.uid())));

create policy "creators see their own audience"
  on public.instagram_audience for select to authenticated
  using (exists (select 1 from public.instagram_accounts a
                  where a.id = instagram_audience.account_id
                    and a.creator_id = (select auth.uid())));

-- Server-verified Instagram stats replace anything the creator typed in.
-- Block creators from editing a verified row's numbers.
create function public.social_accounts_protect_verified()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if auth.uid() is not null and old.verified and (
       new.followers is distinct from old.followers
       or new.engagement_rate is distinct from old.engagement_rate
       or new.avg_views is distinct from old.avg_views
       or new.handle is distinct from old.handle) then
    raise exception 'verified stats are synced from %; disconnect it to edit them',
      old.platform using errcode = '42501';
  end if;
  return new;
end;
$$;

create trigger social_accounts_protect_verified
  before update on public.social_accounts
  for each row execute function public.social_accounts_protect_verified();
