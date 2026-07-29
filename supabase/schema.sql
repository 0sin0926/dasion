-- Dasion P0 스키마: users, items, matches, letters
-- Supabase SQL Editor에서 그대로 실행하면 됩니다.

-- 1. users: auth.users와 1:1 연결되는 프로필 테이블
create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('donor_child', 'donor_parent', 'recipient_child', 'admin')),
  name text not null,
  region text,
  created_at timestamptz not null default now()
);

-- 2. items: 기부 등록된 물품
create table public.items (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.users (id) on delete cascade,
  category text not null check (
    category in ('clothing', 'books', 'toys', 'sports', 'baby', 'etc')
  ),
  name text not null,
  description text, -- 음성 설명 → Whisper STT 변환 결과
  photo_urls text[] not null default '{}',
  voice_url text,
  region text,
  status text not null default 'available' check (status in ('available', 'matched', 'completed')),
  created_at timestamptz not null default now()
);

-- 3. matches: 물품과 수혜자 간 매칭 (기부 받기 액션)
create table public.matches (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.items (id) on delete cascade,
  recipient_id uuid not null references public.users (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'completed')),
  matched_at timestamptz not null default now()
);

-- 4. letters: 기부자 편지(등록 시 작성) + 수혜자 답장(매칭 후 작성)
create table public.letters (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.items (id) on delete cascade,
  match_id uuid references public.matches (id) on delete cascade, -- 답장 편지일 때만 값 존재
  author_id uuid not null references public.users (id) on delete cascade,
  type text not null check (type in ('donor_letter', 'recipient_reply')),
  content text not null, -- 음성 → Whisper STT 변환 결과
  voice_url text,
  created_at timestamptz not null default now()
);

-- Row Level Security: publishable(anon) key를 브라우저에서 안전하게 쓰려면 필수
alter table public.users enable row level security;
alter table public.items enable row level security;
alter table public.matches enable row level security;
alter table public.letters enable row level security;

-- users: 누구나 조회 가능(피드에 이름/지역 표시용), 본인 행만 작성/수정
create policy "users_select_all" on public.users for select using (true);
create policy "users_insert_own" on public.users for insert with check (auth.uid() = id);
create policy "users_update_own" on public.users for update using (auth.uid() = id);

-- items: 누구나 조회 가능(공개 피드), 소유자만 작성/수정/삭제
create policy "items_select_all" on public.items for select using (true);
create policy "items_insert_own" on public.items for insert with check (auth.uid() = owner_id);
create policy "items_update_own" on public.items for update using (auth.uid() = owner_id);
create policy "items_delete_own" on public.items for delete using (auth.uid() = owner_id);

-- matches: 누구나 조회 가능(통계 위젯 등), 로그인 사용자면 기부 받기 액션(insert) 가능
create policy "matches_select_all" on public.matches for select using (true);
create policy "matches_insert_authenticated" on public.matches for insert with check (auth.uid() = recipient_id);
create policy "matches_update_related" on public.matches for update using (
  auth.uid() = recipient_id
  or auth.uid() in (select owner_id from public.items where items.id = matches.item_id)
);

-- letters: 누구나 조회 가능(편지는 공개 게시글 성격), 작성자 본인만 insert
create policy "letters_select_all" on public.letters for select using (true);
create policy "letters_insert_own" on public.letters for insert with check (auth.uid() = author_id);
