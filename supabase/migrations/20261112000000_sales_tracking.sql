-- Sales tracking: which creator drove which sale.
--
--   * Every hired creator gets a tracked link (shor.app/go/<code>) that
--     redirects to the campaign's landing page with UTM tags and a ref.
--   * The brand can give each creator a discount code (created in their
--     own store first).
--   * The brand connects Shopify or WooCommerce by adding a Shor webhook in
--     their store settings. The store-webhook Edge Function verifies each
--     order and credits it to a creator by discount code, or by the ref the
--     tracked link added. Orders that match no creator are not stored.
--   * Brands see their orders; creators see orders from their own deals.

-------------------------------------------------------------------------------
-- Campaign landing page and per-creator discount codes
-------------------------------------------------------------------------------

alter table public.campaigns
  add column landing_url text
    check (landing_url ~ '^https://' and char_length(landing_url) <= 1000);

grant insert (landing_url), update (landing_url) on public.campaigns to authenticated;

alter table public.collaborations
  add column discount_code text
    check (discount_code ~ '^[A-Za-z0-9_-]{3,40}$');

create unique index collaborations_brand_discount_code_key
  on public.collaborations (brand_id, upper(discount_code))
  where discount_code is not null;

grant update (discount_code) on public.collaborations to authenticated;

-- Only the brand sets discount codes.
create function public.collaborations_discount_guard()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.discount_code is distinct from old.discount_code
     and auth.uid() is not null and auth.uid() <> old.brand_id then
    raise exception 'only the brand can set the discount code' using errcode = '42501';
  end if;
  new.discount_code := upper(nullif(trim(new.discount_code), ''));
  return new;
end;
$$;

create trigger collaborations_discount_guard
  before update of discount_code on public.collaborations
  for each row execute function public.collaborations_discount_guard();

-------------------------------------------------------------------------------
-- Tracked links
-------------------------------------------------------------------------------

create table public.tracking_links (
  collaboration_id  uuid primary key references public.collaborations (id) on delete cascade,
  brand_id          uuid not null references public.brand_profiles (id) on delete cascade,
  creator_id        uuid not null references public.creator_profiles (id) on delete cascade,
  code              text not null unique check (code ~ '^[a-z0-9-]{4,48}$'),
  clicks            integer not null default 0,
  last_click_at     timestamptz,
  created_at        timestamptz not null default now()
);

create index tracking_links_brand_idx on public.tracking_links (brand_id);
create index tracking_links_creator_idx on public.tracking_links (creator_id);

revoke all on public.tracking_links from anon, authenticated;
grant select on public.tracking_links to authenticated;
alter table public.tracking_links enable row level security;
create policy "both sides see the deal's link"
  on public.tracking_links for select to authenticated
  using ((select auth.uid()) in (brand_id, creator_id));

-- e.g. "riya-glows-7k2q": readable, unguessable enough, unique.
create function public.make_tracking_code(p_creator uuid)
returns text
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_base text;
  v_code text;
begin
  select left(regexp_replace(lower(coalesce(c.handle, p.full_name, 'creator')), '[^a-z0-9]+', '-', 'g'), 30)
    into v_base
    from public.creator_profiles c join public.profiles p on p.id = c.id
   where c.id = p_creator;
  v_base := trim(both '-' from coalesce(nullif(v_base, ''), 'creator'));
  loop
    v_code := v_base || '-' || substr(md5(gen_random_uuid()::text), 1, 4);
    exit when not exists (select 1 from public.tracking_links where code = v_code);
  end loop;
  return v_code;
end;
$$;

-- Hired creators get a link straight away.
create function public.ensure_tracking_link()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status in ('accepted', 'in_progress', 'awaiting_approval', 'completed') then
    insert into public.tracking_links (collaboration_id, brand_id, creator_id, code)
    values (new.id, new.brand_id, new.creator_id, public.make_tracking_code(new.creator_id))
    on conflict (collaboration_id) do nothing;
  end if;
  return null;
end;
$$;

create trigger ensure_tracking_link
  after insert or update of status on public.collaborations
  for each row execute function public.ensure_tracking_link();

insert into public.tracking_links (collaboration_id, brand_id, creator_id, code)
select c.id, c.brand_id, c.creator_id, public.make_tracking_code(c.creator_id)
  from public.collaborations c
 where c.status in ('accepted', 'in_progress', 'awaiting_approval', 'completed');

-- Counts a click (unless p_count is false, e.g. a link-preview bot) and
-- returns where to send the visitor, or null.
create function public.track_click(p_code text, p_count boolean default true)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_link public.tracking_links;
  v_dest text;
begin
  update public.tracking_links
     set clicks = clicks + case when p_count then 1 else 0 end,
         last_click_at = case when p_count then now() else last_click_at end
   where code = lower(p_code)
  returning * into v_link;
  if not found then
    return null;
  end if;
  select coalesce(c.landing_url, nullif(b.website, '')) into v_dest
    from public.collaborations co
    join public.campaigns c on c.id = co.campaign_id
    join public.brand_profiles b on b.id = co.brand_id
   where co.id = v_link.collaboration_id;
  if v_dest is null then
    return null;
  end if;
  if v_dest !~ '^https?://' then
    v_dest := 'https://' || v_dest;
  end if;
  return v_dest
      || case when position('?' in v_dest) > 0 then '&' else '?' end
      || 'utm_source=shor&utm_medium=influencer&utm_content=' || v_link.code
      || '&ref=shor_' || v_link.code;
end;
$$;

-------------------------------------------------------------------------------
-- Store connections (Shopify, WooCommerce)
-------------------------------------------------------------------------------

create table public.store_connections (
  id               uuid primary key default gen_random_uuid(),
  brand_id         uuid not null default auth.uid() references public.brand_profiles (id) on delete cascade,
  platform         text not null check (platform in ('shopify', 'woocommerce')),
  store_url        text not null check (char_length(store_url) between 4 and 300),
  -- Signing secret from the store's webhook settings. Never readable from
  -- the app (no column grant); only the webhook function uses it.
  webhook_secret   text not null check (char_length(webhook_secret) between 8 and 300),
  orders_received  integer not null default 0,
  orders_matched   integer not null default 0,
  last_order_at    timestamptz,
  created_at       timestamptz not null default now(),
  unique (brand_id, platform)
);

revoke all on public.store_connections from anon, authenticated;
grant select (id, brand_id, platform, store_url, orders_received, orders_matched, last_order_at, created_at)
  on public.store_connections to authenticated;
grant insert (platform, store_url, webhook_secret), update (platform, store_url, webhook_secret), delete
  on public.store_connections to authenticated;

alter table public.store_connections enable row level security;
create policy "brands manage their store connections"
  on public.store_connections for all to authenticated
  using (brand_id = (select auth.uid())) with check (brand_id = (select auth.uid()));

-- Server-only: the secret for verifying a webhook.
create function public.store_webhook_secret(p_connection uuid)
returns table (platform text, webhook_secret text)
language sql
stable
security definer
set search_path = ''
as $$
  select platform, webhook_secret from public.store_connections where id = p_connection;
$$;

-------------------------------------------------------------------------------
-- Attributed orders
-------------------------------------------------------------------------------

create table public.attributed_orders (
  id                uuid primary key default gen_random_uuid(),
  connection_id     uuid not null references public.store_connections (id) on delete cascade,
  brand_id          uuid not null references public.brand_profiles (id) on delete cascade,
  collaboration_id  uuid references public.collaborations (id) on delete set null,
  creator_id        uuid references public.creator_profiles (id) on delete set null,
  external_id       text not null check (char_length(external_id) <= 100),
  amount            numeric(14, 2) not null check (amount >= 0),
  currency          char(3) not null default 'INR',
  matched_by        text not null check (matched_by in ('code', 'link')),
  discount_code     text,
  ordered_at        timestamptz not null,
  cancelled_at      timestamptz,
  created_at        timestamptz not null default now(),
  unique (connection_id, external_id)
);

create index attributed_orders_collab_idx on public.attributed_orders (collaboration_id);
create index attributed_orders_brand_idx on public.attributed_orders (brand_id, ordered_at desc);

revoke all on public.attributed_orders from anon, authenticated;
grant select on public.attributed_orders to authenticated;
alter table public.attributed_orders enable row level security;
create policy "brands see their orders, creators the ones they drove"
  on public.attributed_orders for select to authenticated
  using ((select auth.uid()) in (brand_id, creator_id));

-- Called by the store-webhook function for each verified order. Returns
-- 'attributed', 'unmatched', 'cancelled' or 'unknown_connection'.
create function public.record_store_order(
  p_connection  uuid,
  p_external_id text,
  p_amount      numeric,
  p_currency    text,
  p_codes       text[],
  p_landing     text,
  p_ordered_at  timestamptz,
  p_cancelled   boolean default false)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_brand   uuid;
  v_collab  public.collaborations;
  v_by      text;
  v_code    text;
  v_ref     text;
  v_new     boolean;
begin
  select brand_id into v_brand from public.store_connections where id = p_connection;
  if v_brand is null then
    return 'unknown_connection';
  end if;
  update public.store_connections
     set orders_received = orders_received + 1, last_order_at = now()
   where id = p_connection;

  if p_cancelled then
    update public.attributed_orders set cancelled_at = coalesce(cancelled_at, now())
     where connection_id = p_connection and external_id = p_external_id;
    return 'cancelled';
  end if;

  -- 1. A creator's discount code.
  select c.* into v_collab
    from public.collaborations c
   where c.brand_id = v_brand
     and c.discount_code is not null
     and c.discount_code = any (select upper(trim(x)) from unnest(coalesce(p_codes, '{}')) x)
     and c.status in ('accepted', 'in_progress', 'awaiting_approval', 'completed')
   limit 1;
  if found then
    v_by := 'code';
    v_code := v_collab.discount_code;
  else
    -- 2. The ref our tracked link added to the landing page.
    v_ref := substring(lower(coalesce(p_landing, '')) from 'ref=shor_([a-z0-9-]+)');
    if v_ref is not null then
      select c.* into v_collab
        from public.tracking_links l
        join public.collaborations c on c.id = l.collaboration_id
       where l.code = v_ref and l.brand_id = v_brand;
      if found then
        v_by := 'link';
      end if;
    end if;
  end if;

  if v_by is null then
    return 'unmatched';
  end if;

  insert into public.attributed_orders
    (connection_id, brand_id, collaboration_id, creator_id, external_id, amount,
     currency, matched_by, discount_code, ordered_at)
  values
    (p_connection, v_brand, v_collab.id, v_collab.creator_id, p_external_id,
     greatest(coalesce(p_amount, 0), 0), upper(coalesce(nullif(p_currency, ''), 'INR')),
     v_by, v_code, coalesce(p_ordered_at, now()))
  on conflict (connection_id, external_id) do update
     set amount = excluded.amount
  returning (xmax = 0) into v_new;

  if v_new then
    update public.store_connections set orders_matched = orders_matched + 1
     where id = p_connection;
    perform public.notify(v_collab.creator_id, null, 'sale',
      'You drove a ' || public.format_inr(p_amount) || ' sale for '
        || public.display_name(v_brand),
      case v_by when 'code' then 'A customer used your code ' || v_code || '.'
                else 'A customer bought after clicking your link.' end,
      v_collab.id);
  end if;
  return 'attributed';
end;
$$;

-- Clicks, orders and revenue per collaboration on a campaign, for either
-- side of each deal.
create function public.campaign_sales(p_campaign uuid)
returns table (
  collaboration_id uuid,
  link_code        text,
  discount_code    text,
  clicks           integer,
  orders           integer,
  revenue          numeric
)
language sql
stable
security definer
set search_path = ''
as $$
  select c.id, l.code, c.discount_code, coalesce(l.clicks, 0),
         count(o.id) filter (where o.cancelled_at is null)::integer,
         coalesce(sum(o.amount) filter (where o.cancelled_at is null), 0)
    from public.collaborations c
    left join public.tracking_links l on l.collaboration_id = c.id
    left join public.attributed_orders o on o.collaboration_id = c.id
   where c.campaign_id = p_campaign
     and (select auth.uid()) in (c.brand_id, c.creator_id)
   group by c.id, l.code, c.discount_code, l.clicks;
$$;

revoke execute on function
  public.make_tracking_code(uuid), public.ensure_tracking_link(),
  public.track_click(text, boolean), public.store_webhook_secret(uuid),
  public.record_store_order(uuid, text, numeric, text, text[], text, timestamptz, boolean),
  public.campaign_sales(uuid)
  from public, anon, authenticated;
grant execute on function
  public.track_click(text, boolean), public.store_webhook_secret(uuid),
  public.record_store_order(uuid, text, numeric, text, text[], text, timestamptz, boolean)
  to service_role;
grant execute on function public.campaign_sales(uuid) to authenticated;
