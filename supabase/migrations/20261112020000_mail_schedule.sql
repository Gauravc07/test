-- Email: a welcome notification for new accounts, and the schedule that
-- sends notification emails every 2 minutes.
--
-- The schedule calls the notifications-email Edge Function. It needs two
-- Vault secrets, and does nothing until both exist:
--   select vault.create_secret('https://<ref>.supabase.co', 'shor_project_url');
--   select vault.create_secret('<CRON_SECRET>', 'shor_cron_secret');
-- CRON_SECRET must match the Edge Function secret of the same name.

create extension if not exists pg_net with schema extensions;
create extension if not exists pg_cron;

create function public.send_notification_emails()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_url    text;
  v_secret text;
begin
  select decrypted_secret into v_url from vault.decrypted_secrets where name = 'shor_project_url';
  select decrypted_secret into v_secret from vault.decrypted_secrets where name = 'shor_cron_secret';
  if v_url is null or v_secret is null then
    return;
  end if;
  -- Only call out when something is waiting.
  if not exists (select 1 from public.notifications
                  where email_status = 'pending'
                    and created_at <= now() - interval '2 minutes') then
    return;
  end if;
  perform net.http_post(
    url := rtrim(v_url, '/') || '/functions/v1/notifications-email',
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-cron-secret', v_secret),
    body := '{}'::jsonb);
end;
$$;

revoke execute on function public.send_notification_emails() from public, anon, authenticated;

select cron.schedule('shor-notification-emails', '*/2 * * * *',
                     'select public.send_notification_emails()');

-- Welcome notification (emailed like any other if unread after 2 minutes).
create function public.notify_welcome()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_first text := nullif(split_part(trim(new.full_name), ' ', 1), '');
begin
  perform public.notify(new.id, null, 'welcome',
    'Welcome to Shor' || coalesce(', ' || v_first, ''),
    case new.role
      when 'brand' then 'Post your first campaign brief, or search creators with verified Instagram numbers. You only pay when you approve the work.'
      else 'Add your niches and rates, connect Instagram so brands see verified numbers, and apply to campaigns. Your first 3 deals have no Shor fee.'
    end);
  return null;
end;
$$;

create trigger notify_welcome
  after insert on public.profiles
  for each row execute function public.notify_welcome();

revoke execute on function public.notify_welcome() from public, anon, authenticated;
