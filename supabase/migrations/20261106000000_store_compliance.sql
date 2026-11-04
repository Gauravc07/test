-- App Store / Google Play launch requirements.
--
--   * Terms of use accepted before posting anything (Apple 1.2, Google Play
--     User Generated Content policy): recorded on the profile.
--   * Account deletion from inside the app (Apple 5.1.1(v), Google Play
--     account deletion): delete_my_account(). Personal data goes; invoices
--     stay for the other party's records with the deleted person unlinked.
--   * Blocking abusive users: user_blocks, enforced for chat and for new
--     invitations / applications.
--   * Reporting offensive content and users: content_reports, with a
--     snapshot of the reported content for moderators.
--   * Filtering objectionable text: moderation_terms checked by a trigger on
--     every table that holds user-written text.

-------------------------------------------------------------------------------
-- Text filter
-------------------------------------------------------------------------------

-- Server-only list. Add terms with:
--   insert into public.moderation_terms (term) values ('example');
create table public.moderation_terms (
  term      text primary key check (term ~ '^[a-z]+( [a-z]+)*$' and char_length(term) between 2 and 60),
  added_at  timestamptz not null default now()
);

alter table public.moderation_terms enable row level security;
revoke all on public.moderation_terms from anon, authenticated;

insert into public.moderation_terms (term) values
  ('fuck'), ('fucker'), ('fucking'), ('motherfucker'), ('shit'), ('bullshit'),
  ('bitch'), ('bastard'), ('asshole'), ('cunt'), ('whore'), ('slut'),
  ('dickhead'), ('porn'), ('nudes'),
  ('madarchod'), ('behenchod'), ('bhenchod'), ('chutiya'), ('chutiye'),
  ('bhosdike'), ('bhosda'), ('randi'), ('gandu'), ('harami'), ('lauda'), ('lund');

-- Whole-word, case-insensitive match against the list.
create function public.contains_blocked_terms(p_text text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select p_text is not null and exists (
    select 1 from public.moderation_terms t
     where p_text ~* ('(^|[^[:alnum:]])' || t.term || '($|[^[:alnum:]])')
  );
$$;

-- Trigger: rejects new or changed text in the columns named as arguments.
create function public.reject_blocked_terms()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_new jsonb := to_jsonb(new);
  v_old jsonb := case when tg_op = 'UPDATE' then to_jsonb(old) else '{}'::jsonb end;
  v_col text;
begin
  foreach v_col in array tg_argv loop
    if (v_new ->> v_col) is distinct from (v_old ->> v_col)
       and public.contains_blocked_terms(v_new ->> v_col) then
      raise exception 'Please remove offensive language and try again.'
        using errcode = '22023';
    end if;
  end loop;
  return new;
end;
$$;

create trigger reject_blocked_terms before insert or update on public.messages
  for each row execute function public.reject_blocked_terms('body');
create trigger reject_blocked_terms before insert or update on public.campaigns
  for each row execute function public.reject_blocked_terms('title', 'description', 'guidelines', 'product_details');
create trigger reject_blocked_terms before insert or update on public.collaborations
  for each row execute function public.reject_blocked_terms('pitch');
create trigger reject_blocked_terms before insert or update on public.collaboration_submissions
  for each row execute function public.reject_blocked_terms('caption', 'notes', 'feedback');
create trigger reject_blocked_terms before insert or update on public.creator_profiles
  for each row execute function public.reject_blocked_terms('handle', 'bio');
create trigger reject_blocked_terms before insert or update on public.brand_profiles
  for each row execute function public.reject_blocked_terms('company_name', 'description');
create trigger reject_blocked_terms before insert or update on public.profiles
  for each row execute function public.reject_blocked_terms('full_name');

-------------------------------------------------------------------------------
-- Terms of use acceptance
-------------------------------------------------------------------------------

alter table public.profiles
  add column terms_version      text check (char_length(terms_version) <= 40),
  add column terms_accepted_at  timestamptz;

-- Sign-up sends terms_version in the metadata once the box is ticked.
-- Offensive names are dropped here rather than failing the sign-up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_meta  jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  v_role  public.user_role :=
    case v_meta ->> 'role' when 'brand' then 'brand'::public.user_role
                           else 'creator'::public.user_role end;
  v_name  text := left(trim(coalesce(v_meta ->> 'full_name', v_meta ->> 'name', '')), 120);
  v_terms text := nullif(left(trim(coalesce(v_meta ->> 'terms_version', '')), 40), '');
  v_company text := left(trim(coalesce(v_meta ->> 'company_name', '')), 160);
begin
  if public.contains_blocked_terms(v_name) then v_name := ''; end if;
  if public.contains_blocked_terms(v_company) then v_company := ''; end if;

  insert into public.profiles (id, role, full_name, avatar_url, terms_version, terms_accepted_at)
  values (new.id, v_role, v_name, v_meta ->> 'avatar_url', v_terms,
          case when v_terms is null then null else now() end);

  if v_role = 'brand' then
    insert into public.brand_profiles (id, company_name)
    values (new.id, left(coalesce(nullif(v_company, ''),
                                  nullif(v_name, ''),
                                  nullif(split_part(new.email, '@', 1), ''),
                                  'My brand'), 160));
  else
    insert into public.creator_profiles (id) values (new.id);
  end if;

  return new;
end;
$$;

-- For accounts created before terms were required (and new versions).
create function public.accept_terms(p_version text)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.profiles
     set terms_version = left(trim(p_version), 40), terms_accepted_at = now()
   where id = auth.uid();
$$;

-------------------------------------------------------------------------------
-- Account deletion
-------------------------------------------------------------------------------

-- Invoices and payments survive an account deletion for the other party,
-- without a link to the deleted person.
alter table public.invoices
  add column campaign_title text,
  alter column collaboration_id drop not null,
  alter column brand_id drop not null,
  alter column creator_id drop not null,
  drop constraint invoices_collaboration_id_fkey,
  drop constraint invoices_brand_id_fkey,
  drop constraint invoices_creator_id_fkey,
  add constraint invoices_collaboration_id_fkey foreign key (collaboration_id)
    references public.collaborations (id) on delete set null,
  add constraint invoices_brand_id_fkey foreign key (brand_id)
    references public.brand_profiles (id) on delete set null,
  add constraint invoices_creator_id_fkey foreign key (creator_id)
    references public.creator_profiles (id) on delete set null;

update public.invoices i
   set campaign_title = c.title
  from public.collaborations co
  join public.campaigns c on c.id = co.campaign_id
 where co.id = i.collaboration_id;

alter table public.transactions
  drop constraint transactions_check,
  drop constraint transactions_brand_id_fkey,
  drop constraint transactions_creator_id_fkey,
  add constraint transactions_brand_id_fkey foreign key (brand_id)
    references public.brand_profiles (id) on delete set null,
  add constraint transactions_creator_id_fkey foreign key (creator_id)
    references public.creator_profiles (id) on delete set null;

create or replace function public.invoices_guard()
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
    select title into new.campaign_title from public.campaigns where id = v_collab.campaign_id;

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
    -- Account deletion clears these links; nothing may re-point them.
    if (new.collaboration_id is distinct from old.collaboration_id and new.collaboration_id is not null)
       or (new.brand_id is distinct from old.brand_id and new.brand_id is not null)
       or (new.creator_id is distinct from old.creator_id and new.creator_id is not null) then
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

-- Deletes the signed-in user. Cascades remove their profile, campaigns or
-- collaborations, submissions, chats, lists, blocks, reports they filed
-- (unlinked) and Instagram data, including the token in Vault.
create function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'Please log in again.' using errcode = '42501';
  end if;
  delete from public.instagram_accounts where creator_id = v_uid;
  delete from auth.users where id = v_uid;
end;
$$;

-------------------------------------------------------------------------------
-- Blocking
-------------------------------------------------------------------------------

create table public.user_blocks (
  blocker_id  uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  blocked_id  uuid not null references public.profiles (id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);

create index user_blocks_blocked_idx on public.user_blocks (blocked_id);

revoke all on public.user_blocks from anon, authenticated;
grant select, insert, delete on public.user_blocks to authenticated;
alter table public.user_blocks enable row level security;

create policy "users see their own blocks"
  on public.user_blocks for select to authenticated
  using (blocker_id = (select auth.uid()));
create policy "users block others"
  on public.user_blocks for insert to authenticated
  with check (blocker_id = (select auth.uid()));
create policy "users unblock others"
  on public.user_blocks for delete to authenticated
  using (blocker_id = (select auth.uid()));

-- True if either person blocked the other.
create function public.is_blocked_between(p_a uuid, p_b uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.user_blocks
     where (blocker_id = p_a and blocked_id = p_b)
        or (blocker_id = p_b and blocked_id = p_a)
  );
$$;

-- No new chats or messages between blocked people.
drop policy "participants start conversations" on public.conversations;
create policy "participants start conversations"
  on public.conversations for insert to authenticated
  with check (
    (select auth.uid()) in (brand_id, creator_id)
    and not public.is_blocked_between(brand_id, creator_id)
  );

drop policy "participants send messages as themselves" on public.messages;
create policy "participants send messages as themselves"
  on public.messages for insert to authenticated
  with check (
    sender_id = (select auth.uid())
    and exists (select 1 from public.conversations c
                 where c.id = messages.conversation_id
                   and (select auth.uid()) in (c.brand_id, c.creator_id)
                   and not public.is_blocked_between(c.brand_id, c.creator_id))
  );

-- No new invitations or applications between blocked people.
create function public.collaborations_block_check()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_brand uuid;
begin
  select brand_id into v_brand from public.campaigns where id = new.campaign_id;
  if v_brand is not null and public.is_blocked_between(v_brand, new.creator_id) then
    raise exception 'You can’t work with this account.' using errcode = '42501';
  end if;
  return new;
end;
$$;

create trigger collaborations_block_check
  before insert on public.collaborations
  for each row execute function public.collaborations_block_check();

-------------------------------------------------------------------------------
-- Reports
-------------------------------------------------------------------------------

create type public.report_target as enum ('user', 'campaign', 'message', 'collaboration');
create type public.report_reason as enum
  ('spam', 'scam', 'harassment', 'hate', 'sexual', 'violence', 'impersonation', 'other');
create type public.report_status as enum ('open', 'reviewing', 'actioned', 'dismissed');

create table public.content_reports (
  id                uuid primary key default gen_random_uuid(),
  reporter_id       uuid default auth.uid() references public.profiles (id) on delete set null,
  target_type       public.report_target not null,
  target_id         uuid not null,
  reported_user_id  uuid references public.profiles (id) on delete set null,
  reason            public.report_reason not null,
  details           text check (char_length(details) <= 2000),
  -- What the content said when reported, for moderators only.
  content_snapshot  text,
  status            public.report_status not null default 'open',
  created_at        timestamptz not null default now(),
  reviewed_at       timestamptz,
  resolution_note   text
);

create index content_reports_status_idx on public.content_reports (status, created_at);
create index content_reports_reported_user_idx on public.content_reports (reported_user_id);

create function public.content_reports_before_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid      uuid := auth.uid();
  v_snapshot text;
  v_user     uuid;
begin
  if v_uid is not null then
    new.reporter_id := v_uid;
  end if;
  new.status := 'open';
  new.reviewed_at := null;
  new.resolution_note := null;

  case new.target_type
    when 'message' then
      select m.body, m.sender_id into v_snapshot, v_user
        from public.messages m
        join public.conversations c on c.id = m.conversation_id
       where m.id = new.target_id and new.reporter_id in (c.brand_id, c.creator_id);
    when 'campaign' then
      select concat_ws(E'\n\n', c.title, c.description, c.guidelines, c.product_details), c.brand_id
        into v_snapshot, v_user
        from public.campaigns c
       where c.id = new.target_id;
    when 'collaboration' then
      select co.pitch,
             case when new.reporter_id = co.brand_id then co.creator_id else co.brand_id end
        into v_snapshot, v_user
        from public.collaborations co
       where co.id = new.target_id and new.reporter_id in (co.brand_id, co.creator_id);
    when 'user' then
      select concat_ws(E'\n\n', p.full_name, cp.handle, cp.bio, bp.company_name, bp.description), p.id
        into v_snapshot, v_user
        from public.profiles p
        left join public.creator_profiles cp on cp.id = p.id
        left join public.brand_profiles bp on bp.id = p.id
       where p.id = new.target_id;
  end case;

  if v_user is null then
    raise exception 'That content is no longer available.' using errcode = '22023';
  end if;
  if v_user = new.reporter_id then
    raise exception 'You can’t report yourself.' using errcode = '22023';
  end if;
  new.reported_user_id := v_user;
  new.content_snapshot := left(v_snapshot, 4000);
  return new;
end;
$$;

create trigger content_reports_before_insert
  before insert on public.content_reports
  for each row execute function public.content_reports_before_insert();

revoke all on public.content_reports from anon, authenticated;
-- Reporters can file reports and see their status, but not the snapshot
-- or the moderators' notes.
grant insert (target_type, target_id, reason, details) on public.content_reports to authenticated;
grant select (id, target_type, target_id, reason, details, status, created_at)
  on public.content_reports to authenticated;
alter table public.content_reports enable row level security;

create policy "users file reports"
  on public.content_reports for insert to authenticated
  with check (reporter_id = (select auth.uid()));
create policy "users see their own reports"
  on public.content_reports for select to authenticated
  using (reporter_id = (select auth.uid()));

-------------------------------------------------------------------------------
-- Function privileges
-------------------------------------------------------------------------------

revoke execute on function
  public.contains_blocked_terms(text),
  public.reject_blocked_terms(),
  public.accept_terms(text),
  public.delete_my_account(),
  public.is_blocked_between(uuid, uuid),
  public.collaborations_block_check(),
  public.content_reports_before_insert()
from public, anon, authenticated;

grant execute on function
  public.accept_terms(text),
  public.delete_my_account(),
  public.is_blocked_between(uuid, uuid)
to authenticated;
