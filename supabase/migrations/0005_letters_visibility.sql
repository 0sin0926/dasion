-- 0005: 편지 열람을 "당사자"로 제한
--
-- 왜:
--   지금 letters 는 letters_select_all(공개)라 익명 키로 누구나 편지 본문을 읽는다.
--   편지는 기부자↔수혜자 사이의 사적인 글이므로, 물품 소유자 / 매칭 수혜자 /
--   편지 작성자 본인만 본문을 읽도록 제한한다.
--
--   단, 상세 화면의 "받기 전 잠금"(기대감 유도)은 본문 없이 "편지가 있다"는
--   사실만 알면 되므로, 존재 여부만 돌려주는 security-definer 함수를 따로 공개한다.

-- 1) 공개 select 정책 제거 → 당사자 전용 정책으로 교체
drop policy if exists "letters_select_all" on public.letters;

create policy "letters_select_party" on public.letters for select using (
  -- 편지 작성자 본인
  auth.uid() = author_id
  -- 물품 소유자(기부자)
  or auth.uid() in (
    select owner_id from public.items i where i.id = letters.item_id
  )
  -- 그 물품을 받은 수혜자
  or auth.uid() in (
    select recipient_id from public.matches m where m.item_id = letters.item_id
  )
);

-- 2) 잠금 UI용: 본문 없이 "편지 존재 여부"만 공개로 노출(RLS 우회)
create or replace function public.item_letter_flags(p_item_id uuid)
returns table (has_donor_letter boolean, has_reply boolean)
language sql
security definer
set search_path = public
as $$
  select
    exists(
      select 1 from public.letters l
      where l.item_id = p_item_id and l.type = 'donor_letter'
    ),
    exists(
      select 1 from public.letters l
      where l.item_id = p_item_id and l.type = 'recipient_reply'
    );
$$;

grant execute on function public.item_letter_flags(uuid) to anon, authenticated;
