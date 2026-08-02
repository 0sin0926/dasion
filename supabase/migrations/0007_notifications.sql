-- 0007: 알림(notifications) 테이블 + claim_item 확장
--
-- 알림이 생기는 시점:
--   · 기부 받기(claim): 기부자에게 "기사님 방문/문 앞에 내놓기", 수령자에게 "곧 택배 배송" 알림
--   · 감사 편지 동봉 시: 기부자에게 "감사 편지 도착" 알림
--
-- 왜 security definer 로 넣나:
--   claim 하는 사람(수령자)이 상대(기부자)의 user_id 로 알림 행을 insert 해야 하는데,
--   본인만 쓰는 RLS 로는 불가능하다. 그래서 알림 insert 는 claim_item(정의자 권한) 안에서만
--   수행하고, 테이블엔 insert 정책을 두지 않아 클라이언트가 알림을 위조하지 못하게 한다.

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  type text not null,          -- donation_pickup | delivery_incoming | letter_received | ...
  title text not null,
  body text,
  link text,                   -- 탭하면 이동할 앱 내 경로(예: /items/<id>, /my)
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_created_idx
  on public.notifications (user_id, created_at desc);

alter table public.notifications enable row level security;

-- 본인 알림만 조회/수정(읽음 처리). insert 정책은 두지 않는다(위 주석 참고).
drop policy if exists notifications_select_own on public.notifications;
create policy notifications_select_own on public.notifications
  for select using (auth.uid() = user_id);

drop policy if exists notifications_update_own on public.notifications;
create policy notifications_update_own on public.notifications
  for update using (auth.uid() = user_id);

-- claim_item 을 알림 insert 까지 포함하도록 교체(기존 로직 동일 + 알림 3종)
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
  v_name text;
  v_match public.matches;
begin
  if v_uid is null then
    raise exception 'not_authenticated';
  end if;

  -- 행 잠금으로 동시 수령 방지
  select owner_id, status, name into v_owner, v_status, v_name
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

  -- 기부자(물품 소유자)에게: 수거 안내
  insert into public.notifications (user_id, type, title, body, link)
    values (
      v_owner,
      'donation_pickup',
      '기사님이 곧 방문해요 🚚',
      '"' || v_name || '"의 새 주인이 정해졌어요! 문 앞에 물품을 내놓아 주시면 하나은행 ATM 기사님이 수거하러 갑니다.',
      '/items/' || p_item_id
    );

  -- 수령자(나)에게: 배송 안내
  insert into public.notifications (user_id, type, title, body, link)
    values (
      v_uid,
      'delivery_incoming',
      '택배가 곧 출발해요 📦',
      '"' || v_name || '"이(가) 곧 등록하신 주소로 배송될 예정이에요. 프로필에서 주소가 정확한지 확인해 주세요.',
      '/items/' || p_item_id
    );

  -- 편지는 선택: 내용이 있을 때만 저장 + 기부자에게 편지 도착 알림
  if p_reply is not null and length(trim(p_reply)) > 0 then
    insert into public.letters (item_id, match_id, author_id, type, content)
      values (p_item_id, v_match.id, v_uid, 'recipient_reply', trim(p_reply));

    insert into public.notifications (user_id, type, title, body, link)
      values (
        v_owner,
        'letter_received',
        '감사 편지가 도착했어요 💌',
        '"' || v_name || '"을(를) 받은 친구가 감사 편지를 보냈어요.',
        '/my'
      );
  end if;

  return v_match;
end;
$$;

grant execute on function public.claim_item(uuid, text) to anon, authenticated;
