# Dasion 프로젝트 진행 현황

> 마지막 업데이트: 2026-07-28
> 다음 세션에서 이어서 작업할 때 이 문서를 먼저 참고할 것.

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

---

## 3. 주요 결정 사항

| 항목 | 선택 | 이유 |
|---|---|---|
| 백엔드 | Next.js API Routes (Spring 아님) | Vercel은 Java 서버리스 미지원, 배포/CORS 관리 부담 ↓, Supabase·OpenAI SDK가 JS 1급 지원 |
| DB/스토리지 | Supabase (PostgreSQL + Storage + Auth) | 인증+DB+파일 저장을 한 번에 해결 |
| STT | OpenAI Whisper API | 기획서 명시 스택 |
| 텍스트 생성 | GPT-4o API | 게시글/감사편지 생성 |
| 배포 | Vercel | 프론트+API Routes 동시 배포, 빠른 데모 링크 |
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

1. `npm run dev`로 로컬 화면 확인
2. ~~`https://github.com/0sin0926/dasion`으로 push~~ 완료 (2.3 참고)
3. ~~Vercel 프로젝트 생성 + 연동~~ 완료 — 배포 URL: https://dasion-zeta.vercel.app
   (main push 시 자동 재배포 확인됨)
4. Supabase 프로젝트 생성 + 스키마(`users, items, matches, letters`) 적용
5. Figma 디자인 값/스크린샷 전달받아 P0 화면부터 Mock 데이터로 구현
6. STT/GPT API 라우트 연결해서 실제 등록 플로우 완성 → 재배포
7. 시간 남으면 P1(통계 위젯, 지역/기록 탭) 추가
