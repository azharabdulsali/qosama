create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) > 0),
  total_orders integer not null default 0 check (total_orders >= 0),
  rewards_used integer not null default 0 check (rewards_used >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint rewards_used_not_more_than_earned
    check (rewards_used <= (total_orders / 5))
);

create unique index if not exists customers_name_unique
  on public.customers (lower(btrim(name)));

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_customers_updated_at on public.customers;
create trigger set_customers_updated_at
before update on public.customers
for each row
execute function public.set_updated_at();

alter table public.customers enable row level security;

drop policy if exists "Customers are visible publicly" on public.customers;
create policy "Customers are visible publicly"
on public.customers
for select
to anon, authenticated
using (true);

drop policy if exists "Authenticated admins can add customers" on public.customers;
create policy "Authenticated admins can add customers"
on public.customers
for insert
to authenticated
with check (true);

drop policy if exists "Authenticated admins can update customers" on public.customers;
create policy "Authenticated admins can update customers"
on public.customers
for update
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated admins can delete customers" on public.customers;
create policy "Authenticated admins can delete customers"
on public.customers
for delete
to authenticated
using (true);

-- ── Site Settings (toggle Customer Loyalty visibility) ──

create table if not exists public.site_settings (
  key text primary key,
  value text not null
);

alter table public.site_settings enable row level security;

drop policy if exists "Settings readable by all" on public.site_settings;
create policy "Settings readable by all"
on public.site_settings
for select
to anon, authenticated
using (true);

drop policy if exists "Settings editable by authenticated" on public.site_settings;
create policy "Settings editable by authenticated"
on public.site_settings
for update
to authenticated
using (true)
with check (true);

insert into public.site_settings (key, value)
  values ('show_loyalty', 'true')
  on conflict (key) do nothing;
