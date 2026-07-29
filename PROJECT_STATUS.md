# Dasion 프로젝트 진행 현황

> 마지막 업데이트: 2026-07-29
> 다음 세션에서 이어서 작업할 때 이 문서를 먼저 참고할 것.
> **현재 상태 요약은 맨 아래 "7. 다음 액션"을 먼저 보세요.**

## 1. 프로젝트 개요

**한 줄 정의**: 음성으로 물건을 등록하면 AI가 기부 게시글과 감사 편지를 대신 써주고, 하나은행
ATM에서 집앞 수거까지 이어지는 아동 물품 기부 플랫폼.

- 원본 기획서: `~/Downloads/README.md`
- Figma: https://www.figma.com/design/AJSoGcIxxgzFyVUJYshIaf/clauProject?node-id=1-80&t=a2yMfkxMMqG9eRoK-1
- GitHub 저장소: https://github.com/0sin0926/dasion

### 핵심 사용자
1. 기부 아동(6~8세) — 음성으로 물품 소개
2. 기부 아동의 부모 — 절차 간소화 + 교육적 가치
3. 수혜 아동(취약계층) — 물건 선택 + 감사 편지 작성
4. 하나은행 — ATM 활성화, 어린이 적금 잠재 고객 확보

### 기능 우선순위 (원본 기획서 3번 참고)
- **P0(MVP)**: 하단 탭 네비, 홈 피드, 물품 등록(카테고리→이름→음성설명→사진→편지), 물품 상세+기부받기, 마이페이지
- **P1**: 커뮤니티 통계 위젯, 지역 탭, 기록 탭, 기부-적금 연동 UI(Mock), 수혜자 답장 편지
- **P2**: ATM 박스 신청(Mock), 관리자 대시보드, 물품 상태 알림, ESG 리포트

---

## 2. 지금까지 진행한 작업

### 2.1 홈 디렉터리(`/Users/kim-youngsin`) 정리
기존에 홈 디렉터리 전체가 GitHub `INHA-SW-4bit/4bit_BE`(출석체크 관리, Spring Boot) 저장소의
루트로 잡혀 있어 개인 파일들이 전부 그 작업 트리 안에 들어와 있는 위험한 상태였음. 아래를 삭제해
로컬 git 연동만 해제함(**GitHub 원격 저장소 자체는 그대로 둬서 팀원 작업엔 영향 없음**):
- `.git`, `.gitattributes`, `.gitignore`, `HELP.md`, `README.md`
- `build.gradle`, `settings.gradle`, `gradlew`, `gradlew.bat`, `gradle/`
- `src/`(Spring 소스), `build/`(gradle 빌드 산출물)

### 2.2 `dasion` 프로젝트 스캐폴딩
`/Users/kim-youngsin/dasion`에 Next.js(TypeScript + Tailwind + App Router + `src/` 디렉터리)로
새 프로젝트 생성. `create-next-app`이 자동으로 `git init` + 최초 커밋까지 만들어줌.

폴더 구조:
```
dasion/
  src/app/         프론트 라우트(페이지), globals.css
  src/app/api/     백엔드 API Routes (여기에 STT/GPT 라우트 등 추가 예정)
  src/server/      백엔드 로직(Supabase 클라이언트, AI 서비스 등 추가 예정)
  src/components/  프론트 UI 컴포넌트
  src/types/       프론트/백엔드 공용 타입
```
(Next.js는 API 라우트가 반드시 `app/api` 아래 있어야 해서 완전한 물리적 분리는 아니지만,
라우팅(`app`)과 실제 백엔드 로직(`server`)을 분리해 실질적으로 백/프론트를 나눔)

GitHub 원격 연결 완료(`git remote add origin https://github.com/0sin0926/dasion.git`).

### 2.3 원격 저장소 히스토리 병합 및 push
원격 `0sin0926/dasion`에 로컬과 공통 조상이 없는 별도 히스토리(README.md만 존재, 원본
기획서 내용)가 이미 올라가 있던 상태였음. 로컬 코드(Next.js 스캐폴딩)는 그대로 유지하고
README.md만 원격의 기획서 버전으로 통일해 `--allow-unrelated-histories`로 병합 후 push
완료(`738044a..8c1db5e`). force push 아님 — 정상 병합.

### 2.4 Vercel 배포 파이프라인 연동
`vercel.com/dasion/dasion`에서 GitHub 저장소 import 완료. 배포 URL:
https://dasion-zeta.vercel.app . `main` 브랜치 push 시 자동 재배포 확인됨(Production
Checklist "Connect Git Repository" 완료). 참고로 빌드 중 홈 디렉터리의 무관한
`package-lock.json` 때문에 발생하던 Turbopack 워크스페이스 루트 경고는 `next.config.ts`에
`turbopack.root` 명시해 해결(커밋 `38e95e2`).

### 2.5 Supabase 프로젝트 생성 및 스키마 적용
- 프로젝트명 `dasion`, ID `tpdezuisujvteuvfavzj`, region `ap-northeast-2`(Seoul), Free 플랜
- API 키 체계가 신형(`publishable`/`secret`, `sb_publishable_...`/`sb_secret_...`)이라 구형
  `anon`/`service_role` 대신 이 값 사용. Next.js 환경변수명:
  `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`
- `supabase/schema.sql` 작성 후 Supabase SQL Editor에서 실행 완료 — `users, items, matches,
  letters` 4개 테이블 + RLS 정책(공개 읽기, 본인 소유만 쓰기) 포함
- 로컬 `.env.local`에 키 설정 완료(gitignore로 미커밋 확인됨)
- Vercel 프로젝트에도 동일 3개 환경변수 등록 완료(Settings → **Environments** — 이 Vercel UI
  버전은 메뉴명이 "Environment Variables"가 아니라 "Environments"임에 유의)

### 2.6 디자인 토큰 + 홈 피드 화면 구현 (2026-07-28)
피그마 스크린샷/색상 팔레트/캐릭터 에셋 전달받아 P0 첫 화면 구현.
- **디자인 토큰**(`src/app/globals.css`): 메인 그린 `#346739`, 서브 그린 `#5e9150`, 연한 배경
  `#eaf4e3`, 페이지 배경 `#f9fffb`, 텍스트 잉크 단계(68/40/25%). 폰트 Pretendard(현재 CDN, 추후
  self-host 교체 가능). Tailwind v4 `@theme` 방식
- **폰 프레임 셸**(`src/app/layout.tsx`): 모바일 풀스크린, 데스크톱은 가운데 480px 프레임+그림자
- **캐릭터 에셋**(`public/characters/`): 손 흔들기/선물상자/편지쓰기 3종(투명 PNG)
- **홈 피드**(`src/app/page.tsx` + `src/components/home/*`): 헤더+검색, 히어로+통계위젯(Mock
  890/547/678), 카테고리 필터(클라이언트, 실시간 필터링), 물품 카드 그리드, 하단 CTA, 공통
  하단 탭 네비(`src/components/BottomNav.tsx`)
- **Mock 데이터**: `src/server/mock/items.ts`, 카테고리 정의 `src/lib/categories.ts`, 공용 타입
  `src/types/item.ts`
- `npm run build` 통과, dev 서버 렌더링 확인 완료
- **미확정/추후 교체**: 서브 그린 정확값·카테고리 아이콘 SVG(현재 이모지)·헤더 로고 얼굴(현재
  손흔들기 캐릭터 크롭)은 정확한 에셋 받으면 교체

### 2.7 백엔드 연결 시작 — 토대 + 읽기 계층 (2026-07-28)
Mock을 걷어내고 실제 Supabase 조회로 홈 피드/상세를 연결. 아키텍처 원칙 확정:
- **읽기(피드/상세)**: Next 16 권장대로 Route Handler 없이 **서버 컴포넌트에서 직접 조회**
- **쓰기(등록/기부받기)**: 익명 세션을 가진 **브라우저 클라이언트에서 직접** → RLS `auth.uid()` 자동 충족
- **AI(STT/GPT)**: OpenAI secret key가 필요하므로 `app/api/` Route Handler로 (다음 증분)
- **인증 전략**: **익명 인증(Anonymous Sign-in)** 채택 — 기기별 영구 UUID 유저가 생겨
  기부함/기부받음 개인 기록까지 정상 축적. 로그인 화면은 이후 "업그레이드"로 얹음

구현/변경 파일:
- `@supabase/supabase-js` 설치
- `src/lib/supabase/client.ts` — 브라우저 클라이언트(싱글턴, 세션 유지)
- `src/server/supabase/read-client.ts` — 서버 읽기 전용 클라이언트(publishable 키, RLS 유지)
- `src/server/items/queries.ts` — `getItems(category?)`, `getItemById(id)`(등록자·기부자 편지 조인, UUID 가드로 잘못된 id는 404)
- `src/types/item.ts` — `ItemStatus`에 `completed` 추가, `ItemDetail` 타입 신설
- `src/app/page.tsx` — `getItems()` 연결(조회 실패 시 빈 목록 graceful fallback)
- `src/app/items/[id]/page.tsx` — `getItemById()` 연결 + 사진/설명/기부자 편지 렌더
- `supabase/schema.sql` + `supabase/migrations/0001_category_books.sql` — 카테고리 `books_stationery`→`books` 통일
- `next.config.ts` — `images.remotePatterns`에 Supabase Storage 도메인 허용
- 검증: `tsc` 통과, dev에서 홈 200(현재 DB 비어 빈 상태 정상), 잘못된/없는 상세 id 모두 404

### 2.8 익명 인증 + 물품 등록 쓰기 (2026-07-28)
"로그인 화면 없이 진짜 유저" 전략(익명 인증)으로 등록 플로우를 실제 저장까지 연결. 실제
Supabase에 end-to-end 검증 완료(익명 로그인→프로필→사진 업로드→items→letters→조회→정리 전부 통과).

구현/변경 파일:
- `src/lib/supabase/auth.ts` — `bootstrapAuth()`: 익명 세션 보장 + `users` 프로필 행 보장(upsert, 기본값 role=donor_parent/name=게스트, 기존값은 보존)
- `src/components/AuthBootstrap.tsx` + `layout.tsx` — 앱 진입 시 세션/프로필 자동 보장(화면 출력 없음)
- `src/lib/items/registerItem.ts` — 클라이언트에서 익명 세션으로 직접 쓰기(사진 Storage 업로드 → items insert → 기부자 letters insert). RLS `auth.uid()` 자동 충족
- `src/app/register/page.tsx` — 폼 실 저장: 이름/설명/편지 제어 입력, 사진 업로드+미리보기(최대 5장), 제출/에러 상태. 마이크(STT)는 다음 증분까지 비활성 표시
- `supabase/migrations/0002_storage.sql` — Storage 버킷(item-photos, item-voice) + 업로드/읽기 정책

**Supabase 조치 완료(2026-07-28)**: ①Anonymous sign-ins 활성화 ②0001(카테고리) 실행 ③0002(Storage) 실행 — 모두 적용 확인됨.

**다음 증분 후보**:
- ~~물품 상세 "기부 받기" → `matches` insert + item status 갱신~~ 완료 (2.9 참고)
- ~~마이페이지: 프로필 이름/지역 편집 + 내가 기부한/받은 물품 목록~~ 완료 (2.10 참고)
- STT/GPT 라우트(`/api/stt`, `/api/generate-post`, `/api/generate-letter`) → 등록 플로우 마이크 활성화. **선행: OpenAI API 키 발급 후 `.env.local`·Vercel에 `OPENAI_API_KEY` 등록**

### 2.9 기부 받기(claim) + 감사 편지 (2026-07-29)
물품 상세의 "기부 받기"를 실제 매칭까지 연결. 등록 플로우처럼 **감사 편지(선택)** 를 함께 보낼 수 있는 전용 화면 추가.

- **핵심 결정 — 왜 RPC인가**: 기부 받기는 ①`matches` insert(수령자=나) ②`items.status='matched'` 갱신을 한 번에 해야 하는데, 수령자는 소유자가 아니라 `items_update_own` RLS에 막힘 + 동시 수령 경쟁 상태 문제. → `security definer` 함수 `claim_item(p_item_id, p_reply)` 하나로 RLS 우회 + 행 잠금(`for update`)으로 원자 처리. 편지(`p_reply`)는 선택 인자로, 값 있으면 같은 트랜잭션에서 `recipient_reply` 편지까지 저장(안 쓰면 매칭만).
- **아키텍처 일관성**: 공개 읽기(피드/상세)는 서버 컴포넌트(read-client), 개인/인증 쓰기(등록·기부받기)는 브라우저 클라이언트(익명 세션). 소유자 판별(내 물품이면 버튼 비활성)도 세션이 브라우저에만 있으므로 클라이언트에서 수행.

구현/변경 파일:
- `supabase/migrations/0003_claim_item.sql` — `claim_item` RPC (**아직 Supabase에서 미실행 — 아래 조치 필요**)
- `src/lib/matches/claimItem.ts` — 익명 세션으로 `rpc("claim_item")` 호출, RPC 에러코드(`already_taken`, `cannot_claim_own_item` 등) → 한국어 안내 매핑
- `src/server/items/queries.ts` + `src/types/item.ts` — `getItemById`가 `ownerId` 함께 반환(버튼 소유자 판별용)
- `src/components/items/ReceiveForm.tsx` — 기부받기+편지 폼(등록 편지 카드 스타일 그대로, 주황 음성카드+노란 textarea, 마이크는 STT까지 비활성)
- `src/components/items/ReceiveButton.tsx` — 상세 하단 CTA. 매칭완료/본인물품이면 비활성, 아니면 `/items/[id]/receive`로 이동
- `src/app/items/[id]/receive/page.tsx` + `receive/complete/page.tsx` — 기부받기 화면 + 완료 화면
- `src/app/items/[id]/page.tsx` — 죽어있던 "기부 받기" 버튼을 `ReceiveButton`으로 교체
- 검증: `tsc`·`npm run build` 통과(새 라우트 3개 등록 확인)

**Supabase 조치 완료(2026-07-29)**: `0003_claim_item.sql` SQL Editor에서 실행 완료 — 기부받기 end-to-end 동작 확인됨.

### 2.10 마이페이지 — 프로필 편집 + 내 기부/받은 목록 (2026-07-29)
개인별 데이터가 화면에 처음 드러나는 지점. 익명 세션 유저의 프로필과 기부/수령 기록을 실제로 조회·수정.

- **아키텍처 확정**: 개인/인증 읽기는 세션이 브라우저에만 있으므로 **클라이언트 컴포넌트에서 조회**(공개 읽기=서버 컴포넌트와 대비). `/my`는 `"use client"`로 `bootstrapAuth()` → 프로필·기부·수령 병렬 fetch.
- **DB 추가 스키마 없음**: 기존 `users`/`items`/`matches` + 공개 select 정책(true)으로 전부 커버. 프로필 수정만 `users_update_own`(auth.uid()=id) 사용.

구현/변경 파일:
- `src/types/profile.ts` — `Profile`, `UserRole`, `MatchStatus`, `ReceivedItem`
- `src/lib/profile/profile.ts` — `getMyProfile`, `updateProfile`(이름/지역/역할)
- `src/lib/items/getMyDonations.ts` — 내가 등록한 물품(status 무관 전체, 최신순)
- `src/lib/matches/getMyReceived.ts` — 내가 받은 물품(matches + items 조인)
- `src/components/my/MyItemCard.tsx` — 목록 행 카드(홈 카드와 달리 CTA 대신 상태 뱃지)
- `src/app/my/page.tsx` — 플레이스홀더 교체: 프로필 카드+인라인 편집, 기부한/받은 탭, 빈 상태
- 검증: `tsc`·`npm run build` 통과, dev `/my` 200

### 2.11 프로필 사진 + 지역 선택 고도화 (2026-07-29)
마이페이지 편집 UX 개선. 사진 업로드와 전국 지역 드롭다운 추가.

- **프로필 사진**: 편집 → "사진 등록하기" → ①사진 올리기(구현) ②나만의 캐릭터 만들기(준비 중, 비활성)로 분기. 최종 비전은 아이 얼굴 묘사 기반 **AI 캐릭터 생성**(추후, STT/GPT 트랙과 함께). 지금은 파일 업로드 → `avatars` 버킷 → `users.avatar_url` 저장.
- **지역 선택**: 자유 입력 → **시/도 → 시·군·구 2단 드롭다운**(전국). `src/lib/regions.ts`에 17개 시/도 전체 시군구 데이터(세종은 단층이라 시군구 없음). 저장 형식 `"서울특별시 강남구"`, `parseRegion`/`formatRegion`으로 왕복.

구현/변경 파일:
- `supabase/migrations/0004_user_avatar.sql` — `users.avatar_url` 컬럼 + `avatars` 버킷/정책 (**아직 Supabase 미실행 — 아래 조치 필요**)
- `src/lib/regions.ts` — 전국 시/도→시군구 데이터 + `parseRegion`/`formatRegion`/`getSigungu`
- `src/lib/profile/uploadAvatar.ts` — 사진 Storage 업로드 → 공개 URL
- `src/lib/profile/profile.ts` + `src/types/profile.ts` — `avatarUrl` 반영(getMyProfile select, updateProfile 선택적 갱신)
- `src/app/my/page.tsx` — 편집 폼에 사진 섹션 + 지역 2단 select, 비편집 카드에 사진 표시
- 검증: `tsc`·`npm run build` 통과, dev `/my` 200

**⚠️ Supabase 조치 필요**: `supabase/migrations/0004_user_avatar.sql` 실행해야 프로필 **사진 저장**이 동작함(지역 선택은 마이그레이션 없이 바로 됨 — region 컬럼은 기존).

### 2.12 홈 로고 폰트 + 커뮤니티 통계 실연동 (2026-07-29)
홈 상단 다듬기 + Mock 통계 제거.

- **로고 폰트**: "다시온"을 둥근 한글 폰트 **Jua(주아체)** 로 변경(Google Fonts CDN import). `globals.css`에 `--font-round` 토큰 추가 → `font-round` 유틸로 적용. Jua는 단일 웨이트라 `font-extrabold` 제거, 크기 24→26px.
- **커뮤니티 통계 실연동**: 히어로 위젯 890/547/678(Mock) → 실제 count. 기부된 물품=`items` 전체 수, 참여 가정=`users`(익명 포함) 전체 수, 나눔 완료=`matches` 수. `getCommunityStats()`(read-client, RLS 공개라 count 가능) 추가, 홈에서 `getItems`와 병렬 조회 후 `HeroSection`에 props 전달. `MOCK_STATS`는 사장(파일 `src/server/mock/items.ts` 잔존, 추후 정리).
- **홈 동적 렌더**: 통계/피드가 빌드 시점에 고정되지 않도록 `export const dynamic = "force-dynamic"`. (Next 16: `cacheComponents` 미사용이라 기존 route segment config 모델 유효 — 문서 `route-segment-config`에서 확인. 빌드에서 `/`가 ○→ƒ 전환 확인)

구현/변경 파일:
- `src/app/globals.css` — Jua @import + `--font-round`
- `src/components/home/HomeHeader.tsx` — 로고 `font-round`
- `src/server/items/queries.ts` — `getCommunityStats()` + `CommunityStats`
- `src/components/home/HeroSection.tsx` — `stats` props 수신(Mock import 제거)
- `src/app/page.tsx` — 통계 병렬 조회 + `force-dynamic`
- 검증: `tsc`·`build` 통과(`/`=ƒ), dev 홈 200/폰트·라벨 렌더 확인. **Supabase 조치 불필요**(기존 테이블 count만 사용)

### 2.13 상세 기부자 편지 잠금 + 내 물품 수정 (2026-07-29)
- **기부자 편지 잠금**(상세): 받기 전엔 편지 내용을 숨기고 🔒 "기부를 받고 편지를 확인해봐요!"로 표기(편지가 있는 물품만). 기대감/보상 유도. (추후: 수령자에게는 열람 허용 연결 — `src/app/items/[id]/page.tsx` 주석)
- **내 물품 수정**: 마이페이지 "기부한" 목록 카드에 "수정" 버튼 → `/items/[id]/edit`. 등록 폼과 동일 스타일로 카테고리·이름·설명·사진 편집. 사진은 기존 URL 유지 + 새 파일만 업로드해 교체. 소유자 확인은 클라이언트(세션)에서, 저장은 `items_update_own` RLS로 이중 보호. **편지 수정은 이번 범위 제외**(letters에 update/delete 정책 없음 → 후속 마이그레이션 필요).

구현/변경 파일:
- `src/lib/items/updateItem.ts` — 물품 수정(사진 혼합: string=유지/File=업로드)
- `src/components/items/EditItemForm.tsx` — 수정 폼(프리필 + 소유자 가드)
- `src/app/items/[id]/edit/page.tsx` — 서버 래퍼(getItemById → 폼)
- `src/components/my/MyItemCard.tsx` — Link 중첩 제거 + `editable` 시 "수정" 버튼
- `src/app/my/page.tsx` — 기부한 목록 `editable`
- `src/app/items/[id]/page.tsx` — 편지 잠금 표기
- 검증: `tsc`·`build` 통과(`/items/[id]/edit`=ƒ), dev `/my` 200·잘못된 edit id 404. **Supabase 조치 불필요**

### 2.14 Gemini API 연결 — 음성 AI 파이프 개통 (2026-07-29)
음성→AI 트랙의 첫걸음. **STT/텍스트 생성 제공자를 OpenAI(Whisper+GPT)에서 Google Gemini로 변경.** 이유: ①무료 티어로 데모 트래픽 충분 ②Gemini는 오디오를 직접 입력받아 STT+생성을 한 API로 처리(제공자 1개로 단순화) ③사용자가 이미 Google 계정 보유.
> ⚠️ 주의: 사용자의 Gemini **"Pro 구독"** 과 개발자용 **"Gemini API"** 는 완전 별개다. 구독엔 API가 안 딸려온다 — API는 Google AI Studio에서 무료 티어로 따로 발급.

- `GEMINI_API_KEY` 발급(Google AI Studio) → `.env.local` 등록. **서버 전용 키**라 브라우저 노출 없음(`/api/` 라우트에서만 사용, `NEXT_PUBLIC_` 아님).
- 파이프 스모크 테스트 완료: 서버 라우트에서 `generativelanguage.googleapis.com/v1beta` 호출(`x-goog-api-key` 헤더) → 실제 응답("연결 성공") 수신 확인.
- **모델**: `models/gemini-flash-latest` 안정 별칭 채택. 특정 버전(예: `gemini-2.5-flash`)은 목록엔 떠도 생성 시 "신규 사용자 제공 중단"으로 404가 났고, `flash-latest`는 항상 최신 flash를 가리켜 버전 폐기에 안 깨짐. (2026-07 목록엔 `gemini-3.6-flash`, `gemini-3.5-flash` 등 존재)
- 검증용 임시 라우트(`src/app/api/gemini-test/route.ts`)는 확인 후 **삭제**(키로 모델목록/생성이 열리는 공개 엔드포인트라 잔존 금지).

**⚠️ Vercel 조치 필요**: 배포본에서도 쓰려면 Vercel에 `GEMINI_API_KEY` 등록해야 함. 서버 전용이라 **Sensitive로 넣어도 됨**(브라우저에 안 박혀도 되므로 — Supabase publishable 키와 반대). 미등록 시 로컬만 동작.

**다음**: 등록 폼 마이크(음성 녹음, 현재 비활성) → `/api/stt`(Gemini 오디오 입력) → 텍스트 자동 채움. 이어서 게시글/편지 다듬기 라우트.

### 2.15 음성 등록 — Gemini STT 연결 (2026-07-29)
등록 폼의 마이크 2개(설명·편지)를 실제 음성→텍스트로 활성화. Gemini가 오디오를 직접 입력받아 **전사 + 글 정리를 한 번의 호출로** 처리(별도 STT+생성 2단계 불필요).

- `src/app/api/stt/route.ts` — POST(FormData: `audio`, `mode`). 오디오를 base64 인라인으로 Gemini(`gemini-flash-latest`)에 전달, `mode`(`describe`/`letter`)별 프롬프트로 정리된 텍스트 반환. 15MB 상한, 키없음/빈오디오/실패 에러코드 분리. "실제로 말한 내용에만 근거, 지어내지 말 것" 프롬프트로 환각 억제.
- `src/components/VoiceMic.tsx` — 재사용 녹음 버튼. `getUserMedia`+`MediaRecorder`로 녹음(토글: 누르면 시작, 다시 누르면 종료) → `/api/stt` → `onResult`로 텍스트 콜백. 상태(대기/녹음중/변환중/에러) 표시. **녹음 포맷 선호순 mp4 > ogg > webm** — Gemini가 확실히 받는 포맷 우선, Chrome은 webm 폴백.
- `src/app/register/page.tsx` — disabled 마이크 2개를 `VoiceMic`로 교체(초록=설명→`description`, 주황=편지→`letter`). 결과가 각 textarea에 자동 입력(이후 수동 편집 가능). 미사용 로컬 `MicIcon` 제거.
- **검증**: 서버 파이프는 macOS `say` 한국어 오디오(aiff·m4a) end-to-end 확인 — 전사+정리 정상 동작. `tsc`·`build` 통과(`/api/stt`=ƒ). ⚠️ **브라우저 실제 녹음(마이크 하드웨어)은 수동 테스트 필요** — 헤드리스로 검증 불가.

**⚠️ 남은 조치**:
- **Vercel `GEMINI_API_KEY` 등록**(Sensitive OK) — 배포본 음성 기능에 필수. 미등록 시 로컬(localhost)만 동작.
- 기부받기 편지(`src/components/items/ReceiveForm.tsx`)의 마이크도 동일하게 `VoiceMic`로 교체 가능(다음 증분).
- 녹음 원본 음성 파일(`voice_url`)은 현재 **미저장** — 텍스트만 사용. 필요 시 Storage 업로드 추가.

---

## 3. 주요 결정 사항

| 항목 | 선택 | 이유 |
|---|---|---|
| 백엔드 | Next.js API Routes (Spring 아님) | Vercel은 Java 서버리스 미지원, 배포/CORS 관리 부담 ↓, Supabase·OpenAI SDK가 JS 1급 지원 |
| DB/스토리지 | Supabase (PostgreSQL + Storage + Auth) | 인증+DB+파일 저장을 한 번에 해결 |
| STT | **Google Gemini API** (기존 계획: OpenAI Whisper) | 무료 티어 + 오디오 직접 입력으로 STT+생성을 한 API로 처리, 사용자 Google 계정 보유 (2.14 참고) |
| 텍스트 생성 | **Google Gemini** `gemini-flash-latest` (기존 계획: GPT-4o) | STT와 동일 제공자로 통일 |
| 배포 | Vercel | 프론트+API Routes 동시 배포, 빠른 데모 링크 |
| AWS 경험 방식 | **MVP 완성 후 AWS 재배포(+S3)** | Next.js 스택 유지한 채 같은 앱을 AWS Amplify에 재배포 + 사진/음성 저장을 S3로 이전. 데모는 Vercel로 안전하게 유지하면서 배포·버킷·IAM을 직접 경험. 비용 ≈ 무료(프리티어). RDS/EC2 풀 전환은 세팅·비용 부담으로 제외 |
| 홈 디렉터리 git 정리 범위 | 로컬만 정리 | GitHub 원격(4bit_BE)은 팀 공유 저장소라 손대지 않음 |

---

## 4. Figma 디자인 전달 방법

공유 링크는 로그인이 필요해 Claude가 직접 열람 불가. 아래 중 하나로 전달해야 함.

- **방법 A (권장)**: Figma Dev Mode MCP Server — Professional/Organization/Enterprise 플랜 +
  Dev Mode 시트 필요. 노드 구조·색상/폰트/spacing 값·에셋을 Claude Code가 직접 조회 가능.
- **방법 B (무료 플랜 대안)**: Inspect 패널에서 CSS 값(색상 hex, font-size, padding 등) 복사해
  텍스트로 전달 + 주요 화면 PNG 2x export로 스크린샷 전달 + 아이콘은 SVG export.

---

## 5. Vercel 배포 전략

원칙: **완성 후 배포가 아니라 처음부터 계속 배포.**
1. Next.js 뼈대 생성 직후 GitHub 연동 + Vercel 프로젝트 생성 → 배포 파이프라인부터 검증
2. P0 화면을 하나씩 완성할 때마다 커밋 → push → Vercel이 자동으로 Preview URL 생성
3. 백엔드 연결 전이라도 Mock 데이터로 화면만 배포 가능 (Supabase/OpenAI 키 같은 환경 변수는
   나중에 채워도 무방)

---

## 6. 백엔드 개발 범위

### P0(MVP)에 필요한 실제 백엔드
- Supabase Auth (로그인/회원가입)
- `items` 테이블 CRUD (등록/목록/상세) — 스키마: `users, items, matches, letters`
- Supabase Storage (사진 최대 5장, 음성 파일)
- `/api/stt` — Whisper STT 라우트
- `/api/generate-post`, `/api/generate-letter` — GPT-4o 라우트
- "기부 받기" 액션 처리 (매칭 상태 업데이트)

### P1/P2는 Mock으로 대체 가능
- 지역 탭 / 기록 탭 → 더미 데이터
- 적금 우대금리 시각화, ATM 박스 신청 → 정적 Mock
- 커뮤니티 통계 위젯 → `items` count 정도만 실제 연동, 나머지는 Mock

---

## 7. 다음 액션 (새 세션에서 이어서 진행)

### 현재 상태 (2026-07-29 기준)
**P0 화면 흐름은 백엔드까지 전부 연결·배포 완료.** 로컬·배포본 둘 다 정상 동작 확인됨.

완료된 것(로컬+배포):
- 홈 피드(실데이터) + 커뮤니티 통계 실연동(items/users/matches count) + 로고 둥근 폰트(Jua)
- 물품 등록(`/register`) — 익명 인증으로 실제 저장(사진 Storage + items + 기부자 편지)
- 물품 상세 — 실데이터, 기부자 편지는 **받기 전 잠금**("기부를 받고 편지를 확인해봐요!")
- 기부 받기(`/items/[id]/receive`) — `claim_item` RPC로 매칭+상태갱신+감사편지(선택) 원자 처리
- 마이페이지(`/my`) — 프로필 편집(이름/역할/**사진**/**시·도→시군구 지역**) + 기부한/받은 목록 + **내 물품 수정**(`/items/[id]/edit`)

인프라:
- GitHub `0sin0926/dasion` main push → Vercel 자동 배포(https://dasion-zeta.vercel.app)
- Supabase(`tpdezuisujvteuvfavzj`, seoul) — 스키마 + RLS + Storage + `claim_item` RPC
- **배포 함정 해결됨**: Vercel `NEXT_PUBLIC_*`는 **Sensitive면 클라 번들에 안 박힘** → 비-Sensitive로 재등록해야 브라우저 동작(메모리에도 기록). `SUPABASE_SECRET_KEY`만 Sensitive.

### ⚠️ 확인 필요 (다음 세션에서 점검)
- **`0004_user_avatar.sql` 실행 여부 불확실** — 프로필 **사진 저장**이 배포본에서 되는지 확인. 안 되면 Supabase SQL Editor에서 `supabase/migrations/0004_user_avatar.sql` 실행(avatars 버킷 + `users.avatar_url` 컬럼). 지역/수정 등 나머지는 무관하게 동작.

### 다음 증분 후보 (우선순위 순 제안)
1. **음성 등록 완료 (2.15 참고)** — 등록 폼 마이크(설명·편지)가 실제 Gemini STT로 동작(서버 검증됨). **남은 것: ①Vercel에 `GEMINI_API_KEY` 등록(Sensitive OK) — 배포본 필수 ②브라우저 실제 녹음 수동 테스트 ③기부받기(`ReceiveForm`) 마이크도 `VoiceMic`로 교체**
2. **수령자 편지 열람** — 지금 전부 잠근 기부자 편지를, 기부 받은 수령자에게는 열리도록(matches 확인). 상세 페이지 주석에 자리 표시됨
3. **기부자 편지 수정** — 물품 수정 시 편지도 고치려면 `letters`에 update/delete RLS 정책 필요(마이그레이션). 현재 물품 수정은 편지 제외
4. **AI 프로필 캐릭터 생성** — 마이페이지 "나만의 캐릭터 만들기"(현재 비활성) — 이미지 생성 API
5. **P1 화면** — 지역/기록 탭 실데이터, 커뮤니티 통계 위젯 확장
6. **AWS 재배포(+S3)** 학습 트랙 (3번 결정 참고)

### 세션 시작 루틴
1. `npm run dev` → 로컬 확인 (로컬·배포 **같은 Supabase DB** 공유. 단 익명 로그인 정체성은 origin별로 다름)
2. 작업 → `tsc`·`npm run build` 통과 확인 → 커밋 → main push → Vercel 자동 배포
3. Supabase 스키마 변경은 `supabase/migrations/*.sql` 추가 후 SQL Editor에서 수동 실행(자동 적용 아님)
