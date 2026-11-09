-- Notifications: an in-app inbox, plus an email for anything not read
-- within a few minutes.
--
--   * Database triggers write a row whenever someone needs to act: invited,
--     applied, hired, draft or live post sent, changes requested, invoice
--     raised or decided, new message. The app never writes notifications,
--     so nobody can send one in someone else's name.
--   * People see only their own. They can mark them read; nothing else.
--   * The notifications-email Edge Function sends what is still unread
--     after 2 minutes, one email per person per run, unless they turned
--     email off in settings.

-------------------------------------------------------------------------------
-- Table
-------------------------------------------------------------------------------

alter table public.profiles
  add column email_notifications boolean not null default true;

grant update (email_notifications) on public.profiles to authenticated;

create table public.notifications (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references public.profiles (id) on delete cascade,
  actor_id          uuid references public.profiles (id) on delete set null,
  kind              text not null,
  title             text not null check (char_length(title) <= 300),
  body              text check (char_length(body) <= 1000),
  -- Where tapping the notification goes.
  collaboration_id  uuid references public.collaborations (id) on delete cascade,
  conversation_id   uuid references public.conversations (id) on delete cascade,
  read_at           timestamptz,
  email_status      text not null default 'pending'
                      check (email_status in ('pending', 'sent', 'skipped', 'failed')),
  emailed_at        timestamptz,
  created_at        timestamptz not null default now()
);

create index notifications_user_created_idx on public.notifications (user_id, created_at desc);
create index notifications_unread_idx on public.notifications (user_id) where read_at is null;
create index notifications_email_queue_idx on public.notifications (created_at)
  where email_status = 'pending';

comment on table public.notifications is
  'Written only by triggers. email_status tracks the notifications-email function.';

revoke all on public.notifications from anon, authenticated;
grant select on public.notifications to authenticated;
grant update (read_at) on public.notifications to authenticated;

alter table public.notifications enable row level security;

create policy "people see their own notifications"
  on public.notifications for select to authenticated
  using (user_id = (select auth.uid()));
create policy "people mark their own notifications read"
  on public.notifications for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table public.notifications;
  end if;
end $$;

-------------------------------------------------------------------------------
-- Helpers
-------------------------------------------------------------------------------

-- "₹1,00,000" or "₹1,234.50": Indian digit grouping, paise only when there are any.
create function public.format_inr(p_amount numeric)
returns text
language sql
immutable
set search_path = ''
as $$
  select '₹' || case
           when length(i) <= 3 then i
           else regexp_replace(left(i, length(i) - 3), '(\d)(?=(\d\d)+$)', '\1,', 'g')
                || ',' || right(i, 3)
         end
         || case when f = '00' then '' else '.' || f end
    from (select trunc(abs(coalesce(p_amount, 0)))::bigint::text as i,
                 lpad((round(abs(coalesce(p_amount, 0)) * 100)::bigint % 100)::text, 2, '0') as f) x;
$$;

-- What other people see as someone's name.
create function public.display_name(p_user uuid)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (select nullif(trim(b.company_name), '') from public.brand_profiles b where b.id = p_user),
    (select nullif(trim(p.full_name), '') from public.profiles p where p.id = p_user),
    (select '@' || c.handle from public.creator_profiles c where c.id = p_user and c.handle is not null),
    'Someone on Shor');
$$;

-- Adds one notification. Skips notifying yourself and people who blocked
-- each other.
create function public.notify(
  p_user uuid,
  p_actor uuid,
  p_kind text,
  p_title text,
  p_body text default null,
  p_collaboration uuid default null,
  p_conversation uuid default null)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_user is null or p_user = p_actor then
    return;
  end if;
  if p_actor is not null and public.is_blocked_between(p_user, p_actor) then
    return;
  end if;
  insert into public.notifications
    (user_id, actor_id, kind, title, body, collaboration_id, conversation_id)
  values
    (p_user, p_actor, p_kind, left(p_title, 300), left(p_body, 1000), p_collaboration, p_conversation);
end;
$$;

-------------------------------------------------------------------------------
-- Collaborations: invites, applications, hiring, cancelling
-------------------------------------------------------------------------------

create function public.notify_collaboration()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor    uuid := auth.uid();
  v_campaign text;
  v_brand    text := public.display_name(new.brand_id);
  v_creator  text := public.display_name(new.creator_id);
  v_move     text;
begin
  select title into v_campaign from public.campaigns where id = new.campaign_id;

  if tg_op = 'INSERT' then
    if new.status = 'invited' then
      perform public.notify(new.creator_id, new.brand_id, 'invited',
        v_brand || ' invited you to ' || v_campaign,
        case when new.agreed_amount is not null
             then 'Their offer is ' || public.format_inr(new.agreed_amount) || '. Accept or decline the invitation.'
             else 'Open the invitation to see the brief.' end,
        new.id);
    elsif new.status = 'applied' then
      perform public.notify(new.brand_id, new.creator_id, 'applied',
        v_creator || ' applied to ' || v_campaign,
        left(nullif(trim(new.pitch), ''), 200), new.id);
    end if;
    return null;
  end if;

  if new.status is not distinct from old.status then
    return null;
  end if;
  v_move := old.status::text || '>' || new.status::text;

  -- in_progress, awaiting_approval and completed follow from content
  -- submissions, which send their own notifications.
  case v_move
    when 'applied>accepted' then
      perform public.notify(new.creator_id, v_actor, 'hired',
        'You''re hired for ' || v_campaign,
        v_brand || ' accepted your application. Share a draft when it''s ready.', new.id);
    when 'applied>declined' then
      perform public.notify(new.creator_id, v_actor, 'declined',
        v_brand || ' went with other creators for ' || v_campaign,
        'Keep applying. New campaigns go live every week.', new.id);
    when 'invited>accepted' then
      perform public.notify(new.brand_id, v_actor, 'invite_accepted',
        v_creator || ' accepted your invitation to ' || v_campaign,
        'They will share a draft for you to review.', new.id);
    when 'invited>declined' then
      perform public.notify(new.brand_id, v_actor, 'invite_declined',
        v_creator || ' declined your invitation to ' || v_campaign, null, new.id);
    when 'applied>cancelled' then
      perform public.notify(new.brand_id, v_actor, 'withdrawn',
        v_creator || ' withdrew their application to ' || v_campaign, null, new.id);
    when 'invited>cancelled', 'accepted>cancelled', 'in_progress>cancelled' then
      perform public.notify(new.creator_id, v_actor, 'cancelled',
        v_brand || ' cancelled ' || v_campaign, null, new.id);
    else
      null;
  end case;
  return null;
end;
$$;

create trigger notify_collaboration
  after insert or update of status on public.collaborations
  for each row execute function public.notify_collaboration();

-------------------------------------------------------------------------------
-- Content: drafts and live posts
-------------------------------------------------------------------------------

create function public.notify_submission()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_campaign text;
begin
  select c.title into v_campaign
    from public.collaborations co join public.campaigns c on c.id = co.campaign_id
   where co.id = new.collaboration_id;

  if tg_op = 'INSERT' then
    perform public.notify(new.brand_id, new.creator_id,
      case new.kind when 'draft' then 'draft_submitted' else 'live_submitted' end,
      case new.kind
        when 'draft' then public.display_name(new.creator_id) || ' sent a draft for ' || v_campaign
        else public.display_name(new.creator_id) || ' posted live for ' || v_campaign end,
      case new.kind
        when 'draft' then 'Approve it or ask for changes.'
        else 'Check the post and approve it to complete the collaboration.' end,
      new.collaboration_id);
    return null;
  end if;

  if new.status is not distinct from old.status then
    return null;
  end if;
  if new.status = 'approved' then
    perform public.notify(new.creator_id, new.brand_id, 'approved',
      case new.kind
        when 'draft' then 'Your draft for ' || v_campaign || ' is approved'
        else 'Your live post for ' || v_campaign || ' is approved' end,
      case new.kind
        when 'draft' then 'Post it on Instagram, then share the live link.'
        else 'The collaboration is complete. Request your payment.' end,
      new.collaboration_id);
  elsif new.status = 'changes_requested' then
    perform public.notify(new.creator_id, new.brand_id, 'changes_requested',
      public.display_name(new.brand_id) || ' asked for changes on ' || v_campaign,
      left(new.feedback, 300), new.collaboration_id);
  end if;
  return null;
end;
$$;

create trigger notify_submission
  after insert or update of status on public.collaboration_submissions
  for each row execute function public.notify_submission();

-------------------------------------------------------------------------------
-- Invoices
-------------------------------------------------------------------------------

create function public.notify_invoice()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    perform public.notify(new.brand_id, new.creator_id, 'invoice_raised',
      public.display_name(new.creator_id) || ' sent an invoice for ' || public.format_inr(new.brand_total),
      new.invoice_number || coalesce(' · ' || new.campaign_title, '') || '. Approve it once you''re happy with the work.',
      new.collaboration_id);
    return null;
  end if;

  if new.status is not distinct from old.status then
    return null;
  end if;
  case new.status
    when 'approved' then
      perform public.notify(new.creator_id, new.brand_id, 'invoice_approved',
        public.display_name(new.brand_id) || ' approved your invoice for ' || public.format_inr(new.net_amount),
        new.invoice_number || coalesce(' · ' || new.campaign_title, ''), new.collaboration_id);
    when 'rejected' then
      perform public.notify(new.creator_id, new.brand_id, 'invoice_rejected',
        public.display_name(new.brand_id) || ' declined invoice ' || new.invoice_number,
        'Check the collaboration chat to sort it out.', new.collaboration_id);
    when 'paid' then
      perform public.notify(new.creator_id, null, 'invoice_paid',
        'You''ve been paid ' || public.format_inr(new.net_amount),
        new.invoice_number || coalesce(' · ' || new.campaign_title, ''), new.collaboration_id);
    else
      null;
  end case;
  return null;
end;
$$;

create trigger notify_invoice
  after insert or update of status on public.invoices
  for each row execute function public.notify_invoice();

-------------------------------------------------------------------------------
-- Messages: one unread notification per chat, updated as messages arrive
-------------------------------------------------------------------------------

create function public.notify_message()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_conv      public.conversations;
  v_recipient uuid;
  v_title     text;
begin
  select * into v_conv from public.conversations where id = new.conversation_id;
  v_recipient := case when new.sender_id = v_conv.brand_id then v_conv.creator_id else v_conv.brand_id end;
  v_title := 'New message from ' || public.display_name(new.sender_id);

  update public.notifications
     set body = left(new.body, 200), created_at = now(), title = v_title
   where user_id = v_recipient
     and conversation_id = new.conversation_id
     and kind = 'message'
     and read_at is null;
  if not found then
    perform public.notify(v_recipient, new.sender_id, 'message', v_title,
      left(new.body, 200), null, new.conversation_id);
  end if;
  return null;
end;
$$;

create trigger notify_message
  after insert on public.messages
  for each row execute function public.notify_message();

-- Reading a chat clears its message notification.
create function public.clear_message_notification()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.notifications
     set read_at = now()
   where conversation_id = new.conversation_id
     and kind = 'message'
     and read_at is null
     and user_id = (select auth.uid());
  return null;
end;
$$;

create trigger clear_message_notification
  after update of read_at on public.messages
  for each row when (old.read_at is null and new.read_at is not null)
  execute function public.clear_message_notification();

-------------------------------------------------------------------------------
-- Email queue (service role only)
-------------------------------------------------------------------------------

-- Claims notifications that are still unread after p_delay, marking each
-- 'sent' or 'skipped' (already read, or email turned off). Returns the ones
-- to email. Rows locked by another run are skipped, so runs can overlap.
create function public.claim_notification_emails(
  p_limit integer default 200,
  p_delay interval default interval '2 minutes')
returns table (
  id                uuid,
  user_id           uuid,
  email             text,
  full_name         text,
  kind              text,
  title             text,
  body              text,
  collaboration_id  uuid,
  conversation_id   uuid,
  created_at        timestamptz
)
language sql
security definer
set search_path = ''
as $$
  with batch as (
    select n.id
      from public.notifications n
     where n.email_status = 'pending'
       and n.created_at <= now() - p_delay
     order by n.created_at
     limit p_limit
       for update skip locked
  ),
  claimed as (
    update public.notifications n
       set email_status = case
             when n.read_at is not null or not p.email_notifications or u.email is null then 'skipped'
             else 'sent' end,
           emailed_at = now()
      from batch b, public.profiles p, auth.users u
     where n.id = b.id and p.id = n.user_id and u.id = n.user_id
    returning n.id, n.user_id, u.email::text, p.full_name, n.kind, n.title, n.body,
              n.collaboration_id, n.conversation_id, n.created_at, n.email_status
  )
  select id, user_id, email, full_name, kind, title, body, collaboration_id, conversation_id, created_at
    from claimed
   where email_status = 'sent';
$$;

-- Marks notifications whose email could not be sent.
create function public.fail_notification_emails(p_ids uuid[])
returns void
language sql
security definer
set search_path = ''
as $$
  update public.notifications set email_status = 'failed' where id = any (p_ids);
$$;

revoke execute on function
  public.notify(uuid, uuid, text, text, text, uuid, uuid),
  public.claim_notification_emails(integer, interval),
  public.fail_notification_emails(uuid[]),
  public.notify_collaboration(), public.notify_submission(), public.notify_invoice(),
  public.notify_message(), public.clear_message_notification()
  from public, anon, authenticated;
grant execute on function
  public.claim_notification_emails(integer, interval),
  public.fail_notification_emails(uuid[])
  to service_role;

revoke execute on function public.display_name(uuid) from public, anon;
grant execute on function public.display_name(uuid), public.format_inr(numeric) to authenticated;
