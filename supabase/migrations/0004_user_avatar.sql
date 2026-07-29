-- 0004: 프로필 사진(avatar)
-- users.avatar_url 컬럼 추가 + 아바타 전용 Storage 버킷/정책.
-- Supabase SQL Editor에서 실행하세요. (재실행 가능하도록 작성)

-- 1. users 에 avatar_url 컬럼 (없을 때만)
alter table public.users add column if not exists avatar_url text;

-- 2. 아바타 버킷 (public: 공개 URL로 표시)
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- 3. 업로드 정책: 로그인 사용자(익명 포함)면 avatars 버킷에 업로드 가능
drop policy if exists "avatars_insert" on storage.objects;
create policy "avatars_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'avatars');

-- 4. 읽기 정책: 누구나 조회(프로필 사진은 공개 표시)
drop policy if exists "avatars_select" on storage.objects;
create policy "avatars_select" on storage.objects
  for select using (bucket_id = 'avatars');
