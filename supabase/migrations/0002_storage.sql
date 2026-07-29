-- 물품 사진/음성 저장용 Storage 버킷 + 접근 정책.
-- Supabase SQL Editor에서 실행하세요. (재실행 가능하도록 작성)

-- 1. 버킷 생성 (public: 공개 URL로 피드/상세에서 바로 표시)
insert into storage.buckets (id, name, public)
values ('item-photos', 'item-photos', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('item-voice', 'item-voice', true)
on conflict (id) do nothing;

-- 2. 업로드 정책: 로그인 사용자(익명 포함, JWT role=authenticated)면 두 버킷에 업로드 가능
drop policy if exists "item_media_insert" on storage.objects;
create policy "item_media_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id in ('item-photos', 'item-voice'));

-- 3. 읽기 정책: 누구나 조회(공개 피드/상세에서 URL로 표시)
drop policy if exists "item_media_select" on storage.objects;
create policy "item_media_select" on storage.objects
  for select using (bucket_id in ('item-photos', 'item-voice'));
