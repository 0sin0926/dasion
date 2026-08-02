-- 0006: users 에 상세 주소(택배 배송지) 컬럼 추가
-- 기부 받은 물품을 택배로 받을 실제 주소. 본인만 조회/수정(기존 users RLS로 커버).
-- region(시/도·시군구)과 별개로, 도로명/상세주소 전체를 저장한다.

alter table public.users
  add column if not exists address text;
