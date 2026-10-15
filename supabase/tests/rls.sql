begin;

-- Run this file in the Supabase SQL editor after creating two test auth users.
-- Replace the UUIDs with users created only for this test, never real accounts.
\set user_a '00000000-0000-0000-0000-000000000001'
\set user_b '00000000-0000-0000-0000-000000000002'

insert into public.board_items (user_id, id, type, value)
values (:'user_a', 'rls-a', 'text', 'user A');
insert into public.board_items (user_id, id, type, value)
values (:'user_b', 'rls-b', 'text', 'user B');

set local role authenticated;
select set_config('request.jwt.claim.role', 'authenticated', true);
select set_config('request.jwt.claim.sub', :'user_a', true);

do $$
begin
  if (select count(*) from public.board_items) <> 1 then
    raise exception 'RLS select failed: user A can see another user row';
  end if;
  if exists (select 1 from public.board_items where user_id::text = :'user_b') then
    raise exception 'RLS select failed: user A can see user B';
  end if;
end
$$;

update public.board_items set value = 'changed by A'
where user_id::text = :'user_b' and id = 'rls-b';
do $$
begin
  if (select value from public.board_items where user_id::text = :'user_b' and id = 'rls-b') <> 'user B' then
    raise exception 'RLS update failed: user A changed user B';
  end if;
end
$$;

delete from public.board_items
where user_id::text = :'user_b' and id = 'rls-b';
do $$
begin
  if exists (select 1 from public.board_items where user_id::text = :'user_b' and id = 'rls-b') then
    raise exception 'RLS delete failed: user A deleted user B';
  end if;
end
$$;

reset role;
select set_config('request.jwt.claim.role', 'anon', true);
select set_config('request.jwt.claim.sub', '', true);

do $$
begin
  if has_table_privilege('anon', 'public.board_items', 'select') then
    raise exception 'RLS anon failed: unauthenticated role still has select permission';
  end if;
end
$$;

rollback;
