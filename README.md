# PHILO LAB | 생각실험실

> **“생각하고, 선택하고, 논쟁하라.”**
> 윤리, 철학, 사회를 배우고 즐기는 공간

고등학교 **윤리와 사상 · 현대 사회와 윤리 · 통합사회** 수업을 위한 통합 플랫폼입니다.
교과 탐색, 철학·윤리 게임(PHILOSOPHY ARCADE), 수업 프로젝트, 동아리 활동, 교사 수업자료 포트폴리오를 한곳에 모았고,
**학생·게스트·관리자** 계정 구조와 관리자 페이지에서의 콘텐츠 관리 기능을 갖추고 있습니다.

| 공간 | 경로 | 내용 |
| --- | --- | --- |
| HOME | `#/` | 대시보드 · 오늘의 철학 질문 · PHILOSOPHY ARCADE · 나의 철학 프로필 |
| 수업 | `#/classes` | 과목 → 주제(사상가/쟁점) → 수업 구조(핵심 개념·설명·비교·활동·게임·미니퀴즈·시험 대비), 학습 완료 표시 |
| 철학자 | `#/philosophers` | 철학자 도감 (지역·시대 필터, 검색) · 상세 = 수업/게임/프로젝트/자료/딜레마 허브 |
| 게임 | `#/games` | 심리테스트·생존게임·퀴즈·딜레마·대결·추리·예정 콘텐츠 |
| 프로젝트 | `#/projects` | 토론·사회문제·생각실험·융합·캠페인 프로젝트 |
| 동아리 | `#/club/<학년도>/<동아리>` | 학년도별 동아리 · 연간 계획 · 활동 기록 · 결과물 · 갤러리 · 관련 프로젝트 · 지난 활동 |
| 교사자료 | `#/resources` | 수업지도안·수행평가·학습지·PPT 등 (공개 범위별 표시) |
| 로그인 | `#/login` | 학생(학번) / 관리자(아이디) 로그인, 게스트로 둘러보기 |
| MY PHILO LAB | `#/my` | 학생 개인 페이지 (프로필·최근 활동·참여 게임·완료 수업) |
| 관리자 | `#/admin` | ADMIN DASHBOARD (학생·학급·콘텐츠·동아리·공개 범위 관리) |

---

## 1. 기술 스택

- **React 19 + Vite 8** — 정적 SPA (GitHub Pages 배포)
- **React Router (HashRouter)** — 정적 호스팅에서 새로고침/직접 접속 404 방지
- **Supabase** — Auth(비밀번호 해시 관리) · PostgreSQL · Row Level Security · Storage · Edge Functions
- 순수 CSS (`src/styles/global.css`, `src/styles/platform.css`)
- ESLint 10 (flat config) · PGlite(WebAssembly PostgreSQL)로 DB 권한 테스트

## 2. 실행 모드: Supabase 모드 / 데모 모드

| | Supabase 모드 | 데모 모드 |
| --- | --- | --- |
| 조건 | `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` 설정됨 | 환경변수 없음 |
| 인증 | Supabase Auth (실제 계정) | 체험용 계정 (실제 인증 아님) |
| 데이터 | PostgreSQL, RLS 로 권한 제한 | 이 브라우저 localStorage 에만 저장 |
| 표시 | — | 화면 상단에 **🧪 데모 모드** 배너 항상 표시 |

데모 모드 체험 계정 (로그인 화면에도 표시됨)

- 학생: `202620101` / `philo1234` (그 외 `202620102`, `202620201`)
- 관리자: `admin` / `admin1234`

> 데모 모드는 화면·흐름 확인용입니다. 실제 수업에서는 반드시 Supabase 모드로 배포하세요.

## 3. 로컬 실행

Node.js 20.19 이상(22 권장)이 필요합니다.

```bash
npm install          # 의존성 설치
cp .env.example .env.local   # (선택) Supabase 값 입력 — 비워 두면 데모 모드
npm run dev          # http://localhost:5173
npm run lint         # 코드 검사
npm run build        # 프로덕션 빌드 → dist/
npm run test:db      # DB 스키마 + RLS 권한 테스트 (PGlite, 인터넷 불필요)
npm run db:seed      # src/data 의 콘텐츠로 supabase/seed.sql 재생성
```

## 4. 새로운 인증 구조

### 사용자 유형과 권한

| 기능 | 게스트 | 학생 | 관리자 |
| --- | :-: | :-: | :-: |
| HOME · 철학자 도감 · 공개 수업/게임/프로젝트/동아리 기록 | ✅ | ✅ | ✅ |
| 학생 공개(`students`) 콘텐츠 | ❌ | ✅ | ✅ |
| 우리 반 지정(`class`) 콘텐츠 | ❌ | 해당 반만 | ✅ |
| 교사 전용(`admin`) 자료 | ❌ | ❌ | ✅ |
| 학습 완료·활동 기록·심리테스트 결과 저장 | ❌ (로그인 안내) | ✅ 본인 것만 | 조회 |
| MY PHILO LAB | ❌ | ✅ | — |
| `/admin` 관리자 페이지 | ❌ | ❌ (403) | ✅ |

- **게스트**: 계정이 필요 없습니다. 로그인 화면의 [게스트로 둘러보기] 또는 로그인 없이 바로 이용.
- **학생**: 학번(9자리) + 비밀번호로 로그인. 이름·학년·반·번호는 계정 정보(students 테이블)에 저장됩니다.
- **관리자**: 아이디(예: `admin`) + 비밀번호로 로그인. 역할(`profiles.role = 'admin'`)은 **DB 에서만** 부여됩니다.
- 향후 `teacher` 역할을 추가할 수 있도록 `profiles.role` 에 `student | teacher | admin` 이 정의되어 있습니다.

### 학번 · 관리자 아이디 로그인 방식

**학번은 9자리 = 학년도(4) + 학년(1) + 반(2) + 번호(2)** 입니다.
예) 2026학년도 2학년 1반 1번 → 학교 학번 `20101` → PHILO LAB 학번 **`202620101`**
(학년도를 붙여 해마다 학번이 겹치지 않고, 이전 학년도 기록이 그대로 보존됩니다.)

Supabase Auth 는 이메일 형식 식별자가 필요하므로 앱이 내부적으로만 바꿔 사용합니다. 이 주소는 화면에 보이지 않고 메일도 발송되지 않습니다.

| 사용자 | 입력 | 내부 인증 식별자 |
| --- | --- | --- |
| 학생 | `202620101` | `202620101@students.philolab.local` |
| 관리자 | `admin` | `admin@admin.philolab.local` |

### 보안 원칙 (화면에서 버튼만 숨기는 방식이 아님)

- 비밀번호는 Supabase Auth 가 해시로 관리 — 앱 DB·관리자 화면 어디에도 평문 저장/표시 없음
  (무작위 임시 비밀번호는 생성 직후 관리자에게 **한 번만** 표시되고 저장되지 않음)
- 프론트엔드에는 공개용 publishable 키만 사용. **service_role / secret 키는 Edge Function 환경에만 존재**
- 모든 테이블에 **Row Level Security** 적용 (`supabase/migrations/…_init.sql`)
  - 학생은 자기 학생 정보·기록만 조회, 다른 학생 정보 접근 불가
  - 학생은 자기 `role` 을 바꿀 수 없음 (profiles 에 사용자 UPDATE 정책 없음)
  - 콘텐츠 조회는 `can_view(visibility, class_ids)` 로 제한, 추가·수정·삭제는 `is_admin()` 만
- 학생 계정 생성·비밀번호 초기화·비활성화는 Edge Function `admin-students` 가 **호출자의 관리자 역할을 DB에서 다시 확인**한 뒤 처리
- 입력값 검증: 클라이언트 + DB CHECK 제약 + Edge Function 3중 검증
- `.env*` 는 `.gitignore` 처리, `.env.example` 만 제공
- `npm run test:db` 로 위 권한 규칙 35개 항목을 자동 검증

### 개인정보 최소화

- 학생 정보: 학번 · 이름 · 학년 · 반 · 번호 · 학년도 (그 외 수집하지 않음)
- 활동 기록(`activity_logs`): 무엇을(content_type, content_id) · 어떻게(view/complete/play/submit) · 언제 — IP·기기 정보 없음
- 열람(view) 기록은 같은 세션에서 콘텐츠당 1회만 저장

## 5. Supabase 설정 (최초 1회)

1. **프로젝트 생성** — https://supabase.com 에서 New project (Region: Northeast Asia (Seoul) 권장)
2. **DB 초기화** — Dashboard → **SQL Editor** 에서 아래 파일 내용을 순서대로 실행
   1. `supabase/migrations/20261023000000_init.sql` (테이블·RLS·함수)
   2. `supabase/migrations/20261023000100_storage.sql` (이미지 저장소 `media` 버킷)
   3. `supabase/seed.sql` (기본 콘텐츠: 철학자·수업·게임·동아리 등)
3. **Auth 설정** — Authentication → Sign In / Providers
   - Email 로그인 **사용**, **Allow new users to sign up 끄기** (학생은 관리자만 생성)
   - (선택) Confirm email 끄기 — 관리자가 만든 계정은 이미 확인 처리되어 있음
4. **Edge Function 배포** (학생 계정 생성용) — 터미널에서
   ```bash
   npx supabase login
   npx supabase link --project-ref <프로젝트 ref>
   npx supabase functions deploy admin-students
   ```
   `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` 는 Supabase 가 함수 환경에 자동으로 넣어 줍니다. (직접 입력할 필요 없음)
5. **환경변수 설정** — Dashboard → Project Settings → API 에서 값 복사
   - 로컬: `.env.local` 에 입력
   - GitHub Pages: 저장소 → **Settings → Secrets and variables → Actions → Variables** 탭에
     `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` 등록 → Actions 에서 재배포
6. **최초 관리자 생성** (아래 6장)

### 필요한 환경변수

| 이름 | 위치 | 설명 |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | `.env.local` / GitHub Variables | 프로젝트 URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `.env.local` / GitHub Variables | 공개용 키 (구 anon key 는 `VITE_SUPABASE_ANON_KEY` 도 허용) |
| `SUPABASE_SERVICE_ROLE_KEY` | Edge Function 환경 (자동) | **프론트엔드·GitHub 에 절대 넣지 않음** |

## 6. 최초 관리자 계정 만들기

관리자 권한은 화면에서 선택할 수 없고, 아래처럼 **Supabase Dashboard 에서만** 부여합니다.

1. Dashboard → **Authentication → Users → Add user → Create new user**
   - Email: **`admin@admin.philolab.local`** (로그인 아이디 `admin` 에 해당 — 다른 아이디를 쓰려면 `아이디@admin.philolab.local`)
   - 강한 비밀번호 입력 (아이디가 단순하므로 **12자 이상, 영문·숫자·기호 조합** 권장), **Auto Confirm User** 체크
2. Dashboard → **SQL Editor** 에서 실행
   ```sql
   update public.profiles
   set role = 'admin'
   where id = (select id from auth.users where email = 'admin@admin.philolab.local');
   ```
3. 사이트 → 로그인 → **관리자** 탭에서 아이디 `admin` 으로 로그인 → `#/admin`

관리자를 해제하려면 `set role = 'student'` 로 바꾸면 됩니다.

## 7. 학생 등록

### 한 명씩
관리자 → **학생 관리 → + 한 명 등록** → 학년도·학년·반·번호·이름 입력 (학번은 자동 생성) → 초기 비밀번호 방식 선택 → 계정 생성

### CSV 일괄 등록
관리자 → **학생 관리 → ⬆ CSV 일괄 등록**

1. **업로드** — 파일 선택 또는 붙여넣기 ([양식 내려받기] 제공). 엑셀에서 *CSV UTF-8* 로 저장하세요.
   ```csv
   학년도,학년,반,번호,학번,이름
   2026,2,1,1,202620101,김민수
   2026,2,1,2,202620102,이서준
   2026,2,1,3,,박지우
   ```
   학번 열을 비워 두면 학년도·학년·반·번호로 자동 생성됩니다(위 3번째 줄 → `202620103`).
2. **미리보기** — 줄별로 표시
3. **오류 확인** — 학년(1~3)·반·번호 범위, 학번 형식(숫자 9자리) 및 학년도·학년·반·번호와 일치 여부, 파일 내 중복, 이미 등록된 학번을 빨간 줄로 표시 (오류 줄은 등록되지 않음)
4. **계정 생성** — 서버(Edge Function)에서 계정 생성, 필요한 학년도·학급 자동 생성

**초기 비밀번호**

- *무작위 임시 비밀번호(권장)* — 학생마다 10자리 생성, 생성 직후 한 번만 화면·CSV 로 제공 (저장되지 않음)
- *공통 초기 비밀번호* — 영문+숫자 8자 이상
- 모든 신규 학생은 `must_change_password` 상태로 만들어져 첫 로그인 시 **비밀번호 변경 화면**으로 이동합니다.
- 비밀번호를 잊은 학생: 학생 관리 → [비밀번호 초기화]
- 전학·졸업: [비활성화] (로그인 차단, 기록 보존)

### 학급
관리자 → **학급 관리** 에서 학년도·학년·반을 추가합니다. 학급은 `class` 공개 범위(특정 반에게만 공개)에 사용됩니다.
해가 바뀌면 새 학년도 학급을 만들고 새 학번으로 학생을 등록합니다. 이전 학년도 학생·기록은 `academic_year` 로 구분되어 그대로 남습니다.

## 8. 코드 수정 없이 콘텐츠 관리

Supabase 모드에서는 관리자 페이지에서 바로 추가·수정·삭제하면 사이트에 즉시 반영됩니다. (GitHub push 불필요)

| 메뉴 | 관리 대상 |
| --- | --- |
| 수업 관리 | 과목별 주제(사상가·쟁점), 쟁점 질문, 수업 구조 내용(JSON), 연결 철학자 |
| 철학자 관리 | 이름·시대·동양/서양·설명·키워드·명언·능력치·대표 이미지·관련 철학자/게임 |
| 게임 관리 | 게임명·설명·썸네일·종류·상태·**외부 주소/내부 주소**·결과 저장 여부 |
| 프로젝트 관리 | 설명·핵심 질문·진행 방법·활동 단계·결과물·자료·관련 철학자 |
| 동아리 관리 | 학년도·동아리·활동 기록(사진·결과물·의견) |
| 교사자료 관리 | 자료 정보·파일 업로드/링크·관련 철학자 |
| 오늘의 철학 질문 | 질문·설명·관련 철학자 |
| 공개 범위 관리 | 모든 콘텐츠의 공개 범위·공개 학급을 한 화면에서 변경 |

모든 콘텐츠는 공통으로 **공개 범위**를 가집니다: `public`(누구나) · `students`(로그인 학생) · `class`(지정 학급) · `admin`(관리자만).
이미지·파일 업로드는 Supabase Storage `media` 버킷(5MB 이하)에 저장됩니다.

> 데모 모드에서도 같은 관리 화면을 체험할 수 있지만, 변경 내용은 그 브라우저에만 저장됩니다.
> `src/data/*` 파일은 데모 모드 데이터이자 DB 초기값(`npm run db:seed`)입니다.

## 9. 심리테스트 · 생존게임 연결

### URL 연결 위치
- **Supabase 모드**: 관리자 → **게임 관리** → `윤리 사상가 심리테스트` (`ethics-personality-test`) → **외부 주소** 입력 → 저장
  (철학자 생존게임은 `philosopher-survival`)
- **데모 모드 / 초기값**: `src/data/games.js` 에서 해당 게임의 `externalUrl` 수정

```js
{ id: 'ethics-personality-test', externalUrl: 'https://<아이디>.github.io/<심리테스트-저장소>/', ... }
{ id: 'philosopher-survival',    externalUrl: 'https://<아이디>.github.io/philosopher-survival-game/', ... }
```

`externalUrl`(https) 또는 `internalRoute` 가 있으면 자동으로 **플레이하기** 버튼이 활성화되고, 없으면 “연결 예정”으로 표시됩니다.

### 심리테스트 결과 연동 (향후)
기존 심리테스트는 수정하지 않아도 되며, 연동하고 싶을 때 결과 화면에 아래 링크(또는 리다이렉트)를 추가하면 됩니다.

```
https://<PHILO LAB 주소>/#/connect/test-result?test=ethics-personality-test&type=kant&philosopher=kant&u=30&d=85&v=55&e=40
```

| 파라미터 | 의미 |
| --- | --- |
| `test` | 게임 id (게임 관리에서 “결과 저장 지원”이 켜진 게임) |
| `type` | 결과 유형 코드 |
| `philosopher` | 가장 닮은 철학자 id (선택) |
| `u` `d` `v` `e` | 공리주의 · 의무론 · 덕 윤리 · 실존주의 점수 (0~100) |

학생이 PHILO LAB 에 로그인한 상태에서 [내 기록에 저장]을 누르면 `test_results` 에 저장되고 MY PHILO LAB 의 철학 프로필에 반영됩니다.
게스트는 결과만 볼 수 있고 저장 시 로그인 안내가 나옵니다. (URL 값은 학생 자기 보고용이므로 성적 평가에는 쓰지 마세요.)

## 10. 동아리 학년도 추가

동아리는 **학년도 → 동아리 → 활동** 구조이며 매년 이름·구성이 달라도 됩니다.

1. 관리자 → 동아리 관리 → **학년도** 탭 → 새 학년도 추가 → (필요 시) 현재 학년도로 지정
2. **동아리** 탭 → 새 동아리 (ID 예: `2027-philosophy`, 학년도 2027)
3. 지난 동아리는 수정 → **지난 동아리로 보관** 켜기 → 동아리 페이지 하단 “지난 활동”에 표시
4. **활동 기록** 탭 → 동아리 선택 → 새 활동 (날짜·사진·학생 결과물·의견·공개 범위)

활동 기록이 있는 동아리는 DB 제약으로 삭제되지 않습니다(기록 보존). 보관 기능을 사용하세요.

## 11. 데이터베이스 구조

`supabase/migrations/20261023000000_init.sql`

| 테이블 | 내용 |
| --- | --- |
| `profiles` | 인증 사용자별 역할(`student/teacher/admin`), 비밀번호 변경 필요 여부 |
| `academic_years` | 학년도 |
| `classes` | 학급 (학년도·학년·반) |
| `students` | 학생 명부 (학번·이름·학년·반·번호·학년도·활성, `user_id` → Auth) |
| `student_classes` | 학생 ↔ 학급 연결 |
| `lessons` | 수업 콘텐츠 (과목·단원·주제·연결 철학자·쟁점·수업 구조) |
| `philosophers` | 철학자 (+ 이미지 출처·제작자·라이선스·종류) |
| `games` | 게임 (`type`, `status`, `internal_route`, `external_url`, `thumbnail`, `save_result`) |
| `projects` · `resources` · `daily_questions` | 프로젝트 · 교사자료 · 오늘의 철학 질문 |
| `clubs` · `club_activities` | 학년도별 동아리 · 활동 기록 |
| `test_results` | 심리테스트 결과 (4개 성향 점수) |
| `activity_logs` | 학생 활동 기록 (최소 정보) |

콘텐츠 테이블 공통 컬럼: `visibility`, `class_ids`, `sort_order`, `created_at`, `updated_at`

콘텐츠 간 연결: `lessons.philosopher_id`, `philosophers.related/games`, `games.philosophers`, `projects.philosophers`,
`resources.philosophers`, `clubs.related_projects`, `club_activities.club_id` — 철학자 상세 페이지가 이 연결로 관련 수업·게임·프로젝트·자료·딜레마를 모아 보여 주며,
통합 검색(Ctrl+K)도 같은 데이터로 철학자·수업·게임·딜레마·프로젝트·동아리·교사자료를 함께 찾습니다.

## 12. 철학자 대표 이미지

필드: `image`, `imageSource`, `imageCreator`, `imageLicense`, `imageType`(`photo | portrait | bust | painting | illustration`)

- 이미지가 없거나 불러오지 못하면 조각상 일러스트로 자동 대체됩니다.
- 사진이 존재할 수 없는 인물(소크라테스·플라톤·공자·맹자 등)에는 실제 사진을 쓰지 않고, 초상화·흉상·전통 이미지만 사용합니다.
- 우선순위: 실제 역사적 사진 → 역사적 초상화 → 흉상·조각 → 전통적인 대표 이미지
- 출처·라이선스가 명확한 이미지(Public Domain, Wikimedia Commons 등)만 사용하고, 상세 페이지에 출처를 표시합니다.
- 샘플: 칸트·데카르트·벤담(회화), 밀(1870년경 사진), 공자(1770년경 판화) — Wikimedia Commons 파일 경로로 연결되어 있습니다.
  **배포 전에 각 출처 페이지에서 라이선스를 한 번 확인하세요.** (작업 환경에서 외부 접속이 차단되어 자동 확인하지 못했습니다)

## 13. GitHub Pages 배포

`main` 브랜치에 push 하면 `.github/workflows/deploy.yml` 이 lint → build → 배포를 자동으로 진행합니다.

- Settings → Pages → Source: **GitHub Actions**
- Supabase 모드로 배포하려면 Settings → Secrets and variables → Actions → **Variables** 에 `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` 등록 후 재배포
- `vite.config.js` 의 `base: './'` + HashRouter 로 하위 경로(`/philo-lab/`)에서도 동작

## 14. 폴더 구조

```
philo-lab/
├─ .github/workflows/deploy.yml   # lint → build → GitHub Pages
├─ supabase/
│  ├─ migrations/                  # 스키마·RLS (init) / Storage 버킷
│  ├─ functions/admin-students/    # 학생 계정 생성·초기화 Edge Function (관리자 전용)
│  ├─ seed.sql                     # 기본 콘텐츠 (npm run db:seed 로 생성)
│  └─ config.toml
├─ scripts/
│  ├─ generate-seed.mjs            # src/data → seed.sql
│  └─ test-db.mjs                  # PGlite 로 RLS 권한 테스트
├─ src/
│  ├─ data/          # 초기 콘텐츠(데모 데이터·seed 원본), 공개 범위 정의, 검색 인덱스
│  ├─ lib/
│  │  ├─ supabase.js       # Supabase 클라이언트 (공개 키만)
│  │  ├─ contentTypes.js   # 콘텐츠 타입 정의 → 관리자 폼·DB 매핑·seed
│  │  ├─ backend/          # supabaseBackend.js / demo.js (같은 인터페이스)
│  │  ├─ csv.js · validation.js
│  ├─ context/       # AuthContext(사용자·역할) / ContentContext(콘텐츠)
│  ├─ hooks/         # useMyRecords · useSchool
│  ├─ components/    # Navbar · Footer · Search · RouteGuards · LoginPromptModal · 카드들 …
│  ├─ pages/         # 공개 페이지 · Login · MyPage · ChangePassword · TestResultConnect
│  │  └─ admin/      # AdminLayout · Dashboard · Students · Classes · Content · Clubs · Visibility
│  └─ styles/        # global.css · platform.css
├─ .env.example
└─ eslint.config.js
```

## 15. 아직 구현되지 않은 기능 (로드맵)

- 윤리 딜레마 · 철학자 데스매치 · 칸트 vs 벤담 · 추리게임 · OX 퀴즈 실제 게임
- 통합사회 도구: 비교우위 게임 · 기회비용 계산기 · 생산가능곡선 시뮬레이터 · 사회문제 선택형 활동
- 수업 구조의 미니퀴즈·시험 대비 실제 문항 (현재 JSON 으로 내용 입력 가능, 채점 기능 없음)
- 교사(`teacher`) 역할 세분화 · 학생 프로젝트 결과물 제출 기능
- 심리테스트 쪽 결과 전송 버튼 (PHILO LAB 쪽 수신 페이지는 준비됨)
