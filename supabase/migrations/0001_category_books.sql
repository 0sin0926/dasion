-- 카테고리 키를 프론트(CategoryKey)에 맞춰 books_stationery -> books 로 통일.
-- 이미 스키마를 적용한 라이브 DB에서 Supabase SQL Editor에 이 파일을 실행하세요.
-- (CHECK 제약은 Postgres가 자동으로 items_category_check 로 명명합니다.)

-- 혹시 기존 데이터에 books_stationery 값이 있다면 먼저 치환
update public.items set category = 'books' where category = 'books_stationery';

alter table public.items drop constraint if exists items_category_check;
alter table public.items add constraint items_category_check
  check (category in ('clothing', 'books', 'toys', 'sports', 'baby', 'etc'));
