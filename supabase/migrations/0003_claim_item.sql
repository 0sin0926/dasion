-- 0003: 기부 받기(claim) RPC
--
-- 왜 RPC인가:
--   "기부 받기"는 ①matches insert(수령자=나) ②items.status='matched' 두 가지를
--   한 번에 해야 하는데, 수령자는 물품 소유자가 아니라서 items_update_own RLS에
--   막힌다. 또 두 명이 동시에 같은 물품을 받는 경쟁 상태도 막아야 한다.
--   → security definer 함수로 RLS를 우회하고, 행 잠금으로 원자적으로 처리한다.
--
-- 편지(p_reply)는 선택. 값이 있으면 같은 트랜잭션에서 recipient_reply 편지까지 저장한다.
create or replace function public.claim_item(p_item_id uuid, p_reply text default null)
returns public.matches
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_owner uuid;
  v_status text;
  v_match public.matches;
begin
  if v_uid is null then
    raise exception 'not_authenticated';
  end if;

  -- 행 잠금으로 동시 수령 방지
  select owner_id, status into v_owner, v_status
    from public.items
    where id = p_item_id
    for update;

  if not found then
    raise exception 'item_not_found';
  end if;
  if v_owner = v_uid then
    raise exception 'cannot_claim_own_item';
  end if;
  if v_status <> 'available' then
    raise exception 'already_taken';
  end if;

  insert into public.matches (item_id, recipient_id)
    values (p_item_id, v_uid)
    returning * into v_match;

  update public.items set status = 'matched' where id = p_item_id;

  -- 편지는 선택: 내용이 있을 때만 저장
  if p_reply is not null and length(trim(p_reply)) > 0 then
    insert into public.letters (item_id, match_id, author_id, type, content)
      values (p_item_id, v_match.id, v_uid, 'recipient_reply', trim(p_reply));
  end if;

  return v_match;
end;
$$;

-- 익명/로그인 사용자가 호출할 수 있도록 실행 권한 부여
grant execute on function public.claim_item(uuid, text) to anon, authenticated;
