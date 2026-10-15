create table public.board_items (
  user_id uuid not null references auth.users(id) on delete cascade,
  id text not null,
  type text not null check (type in ('sticky','text','link')),
  value text not null default '' check (char_length(value) <= 10000),
  x real not null default 0,
  y real not null default 0,
  archived_at timestamptz,
  deleted_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

create table public.notebook_days (
  user_id uuid not null references auth.users(id) on delete cascade,
  day date not null,
  intent text not null default '' check (char_length(intent) <= 2000),
  cells jsonb not null default '[]',
  sizes jsonb not null default '[]',
  note text not null default '' check (char_length(note) <= 20000),
  closing text not null default '' check (char_length(closing) <= 2000),
  next_line text not null default '' check (char_length(next_line) <= 2000),
  deleted_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, day)
);

create table public.settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

create table public.legacy_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null,
  created_at timestamptz not null default now()
);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end
$$;

create trigger t_board before update on public.board_items
for each row execute function public.touch_updated_at();
create trigger t_days before update on public.notebook_days
for each row execute function public.touch_updated_at();
create trigger t_set before update on public.settings
for each row execute function public.touch_updated_at();

alter table public.board_items enable row level security;
alter table public.notebook_days enable row level security;
alter table public.settings enable row level security;
alter table public.legacy_data enable row level security;

create policy board_items_owner on public.board_items
for all to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

create policy notebook_days_owner on public.notebook_days
for all to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

create policy settings_owner on public.settings
for all to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

create policy legacy_data_owner on public.legacy_data
for all to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

revoke all on public.board_items, public.notebook_days, public.settings, public.legacy_data from anon;
grant select, insert, update, delete on public.board_items, public.notebook_days, public.settings, public.legacy_data to authenticated;

create or replace function public.ping()
returns int
language sql
security definer
set search_path = ''
as $$
  select 1
$$;

revoke all on function public.ping() from public;
grant execute on function public.ping() to anon;
