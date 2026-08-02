-- 0008: 닉네임 중복 방지
--
-- 로그인 후 정하는 닉네임은 대소문자 무시하고 유일해야 한다.
-- 단, 익명 유저의 기본 이름 "게스트"는 여러 명이 공유하므로 제외한다(부분 유니크 인덱스).
-- → 실제로 정한 닉네임만 중복 불가, "게스트"는 여럿 허용.

create unique index if not exists users_name_unique_ci
  on public.users (lower(name))
  where name <> '게스트';
