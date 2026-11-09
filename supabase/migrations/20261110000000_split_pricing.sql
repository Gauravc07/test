-- Split pricing: most of Shor's fee moves from the creator to the brand.
--
--   Brand    pays the creator's fee plus "Shor Protection" (7%) plus GST on
--            that 7%.
--   Creator  pays nothing on their first 3 deals, then 5%.
--
-- Rates are fixed on each invoice when it is raised, so later changes to
-- these functions never rewrite an invoice someone has already seen.
-- Invoices raised before this migration keep their old terms: 10% from the
-- creator and nothing from the brand.
--
-- The Flutter app mirrors these numbers in lib/config/pricing.dart for
-- previews. The database is the source of truth.

-------------------------------------------------------------------------------
-- Rates
-------------------------------------------------------------------------------

create function public.brand_fee_rate()
returns numeric language sql immutable set search_path = ''
as $$ select 0.07::numeric $$;

-- Creator fee once their free deals are used up.
create or replace function public.platform_fee_rate()
returns numeric language sql immutable set search_path = ''
as $$ select 0.05::numeric $$;

create function public.creator_free_deals()
returns integer language sql immutable set search_path = ''
as $$ select 3 $$;

-- GST on Shor's own fee. Set to 0 if Shor is not GST registered.
create function public.fee_gst_rate()
returns numeric language sql immutable set search_path = ''
as $$ select 0.18::numeric $$;

grant execute on function public.brand_fee_rate(), public.creator_free_deals(),
  public.fee_gst_rate() to authenticated, service_role;

-------------------------------------------------------------------------------
-- Invoice columns
-------------------------------------------------------------------------------

-- Legacy invoices get 10% from the creator and nothing from the brand
-- through the column defaults. Don't backfill with an UPDATE: invoices_guard
-- would recompute every old platform_fee at the new 5% rate.
alter table public.invoices
  add column creator_fee_rate numeric(5, 4) not null default 0.10,
  add column brand_fee_rate   numeric(5, 4) not null default 0,
  add column brand_fee        numeric(14, 2) not null default 0 check (brand_fee >= 0),
  add column brand_fee_gst    numeric(14, 2) not null default 0 check (brand_fee_gst >= 0);

-- New invoices always get their rates from invoices_pricing.
alter table public.invoices
  alter column creator_fee_rate drop default,
  alter column brand_fee_rate   drop default,
  add column brand_total numeric(14, 2)
    generated always as (gross_amount + brand_fee + brand_fee_gst) stored;

comment on column public.invoices.gross_amount     is 'The creator''s agreed fee for the deal.';
comment on column public.invoices.platform_fee     is 'Shor''s fee taken from the creator. net_amount is what they receive.';
comment on column public.invoices.creator_fee_rate is 'Creator fee rate fixed when the invoice was raised. 0 for a free deal.';
comment on column public.invoices.brand_fee        is 'Shor Protection fee the brand pays on top of gross_amount.';
comment on column public.invoices.brand_fee_gst    is 'GST on brand_fee.';
comment on column public.invoices.brand_total      is 'Everything the brand pays: gross_amount + brand_fee + brand_fee_gst.';

-------------------------------------------------------------------------------
-- Fee calculation
-------------------------------------------------------------------------------

-- Free deals the creator has left. Rejected invoices don't use one up.
create function public.creator_free_deals_left(p_creator uuid)
returns integer
language sql
stable
security definer
set search_path = ''
as $$
  select greatest(0, public.creator_free_deals() - count(*)::integer)
    from public.invoices
   where creator_id = p_creator
     and status <> 'rejected';
$$;

revoke execute on function public.creator_free_deals_left(uuid) from public, anon, authenticated;

-- Runs after invoices_guard: BEFORE triggers on the same event fire in name
-- order, and "invoices_guard" < "invoices_pricing". It overrides the fee
-- invoices_guard sets.
create function public.invoices_pricing()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    -- Serialise invoices from the same creator so two at once can't both
    -- claim the last free deal.
    perform 1 from public.creator_profiles where id = new.creator_id for update;
    new.creator_fee_rate := case
      when public.creator_free_deals_left(new.creator_id) > 0 then 0
      else public.platform_fee_rate()
    end;
    new.brand_fee_rate := public.brand_fee_rate();
  else
    -- Rates never change after the invoice is raised.
    new.creator_fee_rate := old.creator_fee_rate;
    new.brand_fee_rate   := old.brand_fee_rate;
  end if;

  new.platform_fee  := round(new.gross_amount * new.creator_fee_rate, 2);
  new.brand_fee     := round(new.gross_amount * new.brand_fee_rate, 2);
  new.brand_fee_gst := round(new.brand_fee * public.fee_gst_rate(), 2);
  return new;
end;
$$;

create trigger invoices_pricing
  before insert or update on public.invoices
  for each row execute function public.invoices_pricing();

-------------------------------------------------------------------------------
-- What the app shows before an invoice exists
-------------------------------------------------------------------------------

-- The signed-in user's current terms, for previews like "you'll receive".
create function public.my_fee_terms()
returns table (
  brand_fee_rate    numeric,
  creator_fee_rate  numeric,
  gst_rate          numeric,
  free_deals_total  integer,
  free_deals_left   integer
)
language sql
stable
security definer
set search_path = ''
as $$
  select public.brand_fee_rate(),
         public.platform_fee_rate(),
         public.fee_gst_rate(),
         public.creator_free_deals(),
         public.creator_free_deals_left(auth.uid());
$$;

revoke execute on function public.my_fee_terms() from public, anon;
grant execute on function public.my_fee_terms() to authenticated;
