-- Pay-for-sales: a campaign can pay creators a commission on the store
-- orders they drive (tracked link or discount code), on top of or instead of
-- a fixed fee. Orders count once the return window has passed and they
-- weren't cancelled. Creators turn what they've earned into a commission
-- invoice; the brand approves it like any other invoice.

alter table public.campaigns
  -- Percent of each attributed order's value. Null: no commission.
  add column commission_rate      numeric(5, 2) check (commission_rate > 0 and commission_rate <= 50),
  -- Days an order must age before its commission is earned (returns).
  add column commission_hold_days integer not null default 14
                                    check (commission_hold_days between 0 and 60);

grant insert (commission_rate, commission_hold_days) on public.campaigns to authenticated;
grant update (commission_rate, commission_hold_days) on public.campaigns to authenticated;

-- The rate agreed for this deal. Copied from the campaign when the deal is
-- created; the brand may change it until the creator is hired.
alter table public.collaborations
  add column commission_rate numeric(5, 2) check (commission_rate > 0 and commission_rate <= 50);

grant insert (commission_rate), update (commission_rate) on public.collaborations to authenticated;

update public.collaborations c
   set commission_rate = ca.commission_rate
  from public.campaigns ca
 where ca.id = c.campaign_id and ca.commission_rate is not null and c.commission_rate is null;

create function public.collaborations_commission_guard()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    if new.commission_rate is null then
      select commission_rate into new.commission_rate
        from public.campaigns where id = new.campaign_id;
    elsif auth.uid() is not null and auth.uid() = new.creator_id then
      -- Creators can't set their own rate when applying.
      select commission_rate into new.commission_rate
        from public.campaigns where id = new.campaign_id;
    end if;
    return new;
  end if;

  if new.commission_rate is distinct from old.commission_rate and auth.uid() is not null then
    if auth.uid() <> old.brand_id then
      raise exception 'Only the brand can change the commission.' using errcode = '42501';
    end if;
    if old.status not in ('invited', 'applied') then
      raise exception 'The commission is fixed once the creator is hired.' using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;

create trigger collaborations_commission_guard
  before insert or update of commission_rate on public.collaborations
  for each row execute function public.collaborations_commission_guard();

-------------------------------------------------------------------------------
-- Commission invoices
-------------------------------------------------------------------------------

alter table public.invoices
  add column kind text not null default 'fee' check (kind in ('fee', 'commission'));

-- Commission invoices are only created by request_commission_payout, which
-- works out the amount; the app can't write one with any amount it likes.
create function public.invoices_kind_guard()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.kind = 'commission' and auth.uid() is not null
     and coalesce(current_setting('shor.commission_payout', true), '') <> 'on' then
    raise exception 'Request commission from the deal page.' using errcode = '42501';
  end if;
  if tg_op = 'UPDATE' and new.kind is distinct from old.kind then
    raise exception 'an invoice''s kind can''t change' using errcode = '42501';
  end if;
  return new;
end;
$$;

create trigger invoices_kind_guard
  before insert or update of kind on public.invoices
  for each row execute function public.invoices_kind_guard();

-------------------------------------------------------------------------------
-- What a deal has earned
-------------------------------------------------------------------------------

-- Commission for one collaboration, for either side of the deal.
create function public.commission_summary(p_collab uuid)
returns table (
  rate             numeric,
  hold_days        integer,
  confirmed_orders integer,
  confirmed_sales  numeric,
  earned           numeric,
  pending_orders   integer,
  pending          numeric,
  invoiced         numeric,
  available        numeric
)
language sql
stable
security definer
set search_path = ''
as $$
  with c as (
    select co.id, co.commission_rate, ca.commission_hold_days
      from public.collaborations co
      join public.campaigns ca on ca.id = co.campaign_id
     where co.id = p_collab
       and (auth.uid() is null or auth.uid() in (co.brand_id, co.creator_id))
  ), o as (
    select
      count(*) filter (where ordered_at <= now() - make_interval(days => c.commission_hold_days))::integer as n_ok,
      coalesce(sum(amount) filter (where ordered_at <= now() - make_interval(days => c.commission_hold_days)), 0) as s_ok,
      count(*) filter (where ordered_at > now() - make_interval(days => c.commission_hold_days))::integer as n_wait,
      coalesce(sum(amount) filter (where ordered_at > now() - make_interval(days => c.commission_hold_days)), 0) as s_wait
      from c
      left join public.attributed_orders ao
        on ao.collaboration_id = c.id and ao.cancelled_at is null
  ), i as (
    select coalesce(sum(gross_amount), 0) as total
      from public.invoices
     where collaboration_id = p_collab and kind = 'commission' and status <> 'rejected'
  )
  select c.commission_rate, c.commission_hold_days,
         o.n_ok, o.s_ok, round(o.s_ok * coalesce(c.commission_rate, 0) / 100, 2),
         o.n_wait, round(o.s_wait * coalesce(c.commission_rate, 0) / 100, 2),
         i.total,
         greatest(round(o.s_ok * coalesce(c.commission_rate, 0) / 100, 2) - i.total, 0)
    from c, o, i;
$$;

-- The creator turns their earned, not yet invoiced commission into an
-- invoice. Returns the invoice ID.
create function public.request_commission_payout(p_collab uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_collab public.collaborations;
  v_sum    record;
  v_id     uuid;
begin
  -- Lock the deal so two taps can't invoice the same commission twice.
  select * into v_collab from public.collaborations where id = p_collab for update;
  if not found or v_collab.creator_id is distinct from auth.uid() then
    raise exception 'Only the creator on this deal can request its commission.' using errcode = '42501';
  end if;
  if v_collab.commission_rate is null then
    raise exception 'This deal has no sales commission.' using errcode = '22023';
  end if;

  select * into v_sum from public.commission_summary(p_collab);
  if coalesce(v_sum.available, 0) < 1 then
    raise exception 'There''s no earned commission to request yet. Orders count once their return window has passed.' using errcode = '22023';
  end if;

  perform set_config('shor.commission_payout', 'on', true);
  insert into public.invoices (collaboration_id, gross_amount, description, kind)
  values (p_collab, v_sum.available,
          'Sales commission: ' || v_collab.commission_rate || '% of '
            || public.format_inr(v_sum.confirmed_sales) || ' from '
            || v_sum.confirmed_orders || ' order' || case when v_sum.confirmed_orders = 1 then '' else 's' end,
          'commission')
  returning id into v_id;
  perform set_config('shor.commission_payout', 'off', true);
  return v_id;
end;
$$;

-- Sales per deal on a campaign, now with commission.
drop function public.campaign_sales(uuid);
create function public.campaign_sales(p_campaign uuid)
returns table (
  collaboration_id   uuid,
  link_code          text,
  discount_code      text,
  clicks             integer,
  orders             integer,
  revenue            numeric,
  commission_rate    numeric,
  commission_earned  numeric,
  commission_pending numeric
)
language sql
stable
security definer
set search_path = ''
as $$
  select c.id, l.code, c.discount_code, coalesce(l.clicks, 0),
         (select count(*)::integer from public.attributed_orders o
           where o.collaboration_id = c.id and o.cancelled_at is null),
         (select coalesce(sum(o.amount), 0) from public.attributed_orders o
           where o.collaboration_id = c.id and o.cancelled_at is null),
         c.commission_rate, s.earned, s.pending
    from public.collaborations c
    left join public.tracking_links l on l.collaboration_id = c.id
    left join lateral public.commission_summary(c.id) s on true
   where c.campaign_id = p_campaign
     and (select auth.uid()) in (c.brand_id, c.creator_id);
$$;

revoke execute on function
  public.commission_summary(uuid), public.request_commission_payout(uuid),
  public.campaign_sales(uuid), public.collaborations_commission_guard(),
  public.invoices_kind_guard()
  from public, anon, authenticated;
grant execute on function
  public.commission_summary(uuid), public.request_commission_payout(uuid),
  public.campaign_sales(uuid)
  to authenticated;
