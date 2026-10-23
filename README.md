# PHILO LAB | 생각실험실

> **“생각하고, 선택하고, 논쟁하라.”**
> 윤리, 철학, 사회를 배우고 즐기는 공간

고등학교 **윤리와 사상 · 현대 사회와 윤리 · 통합사회** 수업을 위한 통합 플랫폼입니다.
교과 탐색, 철학·윤리 게임(PHILOSOPHY ARCADE), 수업 프로젝트, 동아리 활동, 교사 수업자료 포트폴리오를 한곳에 모았습니다.

| 공간 | 경로 | 내용 |
| --- | --- | --- |
| HOME | `#/` | 대시보드 · 오늘의 철학 질문 · PHILOSOPHY ARCADE · 나의 철학 프로필(데모) |
| 수업 | `#/classes` | 과목 → 주제(사상가/쟁점) → 수업 구조(핵심 개념·설명·비교·활동·게임·미니퀴즈·시험 대비) |
| 철학자 | `#/philosophers` | 철학자 도감 (지역·시대 필터, 검색, 상세 페이지·능력치) |
| 게임 | `#/games` | 심리테스트·생존게임·퀴즈·딜레마·대결·추리·예정 콘텐츠 |
| 프로젝트 | `#/projects` | 토론·사회문제·생각실험·융합·캠페인 프로젝트 |
| 동아리 | `#/club` | 소개 · 연간 활동 · 날짜별 활동 기록 · 결과물 · 갤러리 |
| 교사자료 | `#/resources` | 수업지도안·수행평가·학습지·PPT 등 아카이브 (학생 공개 / 교사 전용) |

---

## 기술 스택

- **React 19 + Vite 8** — 정적 SPA, 백엔드 없음
- **React Router (HashRouter)** — 정적 호스팅에서 새로고침/직접 접속 시 404 방지
- **순수 CSS** (`src/styles/global.css`, CSS 변수 기반 디자인 토큰)
- 폰트: Noto Serif KR · Noto Sans KR · Cinzel (Google Fonts)

## 설치 & 실행

Node.js 20.19 이상(22 권장)이 필요합니다.

```bash
npm install      # 의존성 설치
npm run dev      # 로컬 개발 서버 → http://localhost:5173
npm run build    # 프로덕션 빌드 → dist/
npm run preview  # 빌드 결과 미리보기
```

## GitHub Pages 배포

이 저장소에는 `.github/workflows/deploy.yml`(GitHub Actions)이 포함되어 있어 `main` 브랜치에 push하면 자동으로 빌드·배포됩니다.

1. GitHub 저장소 → **Settings → Pages**
2. **Build and deployment → Source** 를 **GitHub Actions** 로 선택
3. `main`에 push (또는 **Actions → Deploy to GitHub Pages → Run workflow**)
4. 배포 주소: `https://<GitHub 아이디>.github.io/philo-lab/`

**경로(base path) 처리**
- `vite.config.js`의 `base: './'` 로 모든 에셋을 상대경로로 빌드하므로 저장소 이름이 바뀌거나 다른 하위 경로에 올려도 동작합니다.
- 라우팅은 `HashRouter`(`/#/philosophers/kant`)를 사용해 GitHub Pages의 SPA 404 문제가 없습니다.
- `public/` 폴더의 파일은 코드에서 `asset('images/kant.png')`(`src/utils/asset.js`)로 참조하면 base 경로가 자동 반영됩니다.

## 폴더 구조

```
philo-lab/
├─ public/                 # 정적 파일 (favicon, 이미지·자료 파일을 여기에)
├─ src/
│  ├─ data/                # ★ 콘텐츠 데이터 — 대부분의 수정은 여기서
│  │  ├─ site.js           #   사이트 이름·슬로건·메뉴
│  │  ├─ questions.js      #   오늘의 철학 질문
│  │  ├─ philosophers.js   #   철학자 도감
│  │  ├─ classes.js        #   과목·주제·수업 구조
│  │  ├─ games.js          #   게임 (외부 게임 URL 입력)
│  │  ├─ projects.js       #   프로젝트
│  │  ├─ clubs.js          #   동아리 소개·연간 계획·활동 기록
│  │  ├─ resources.js      #   교사자료
│  │  ├─ profile.js        #   나의 철학 프로필 (데모 / 심리테스트 연동 규격)
│  │  └─ searchIndex.js    #   전체 검색 인덱스 (자동 생성)
│  ├─ components/          # 공통 UI
│  │  ├─ Navbar · Footer · Layout · Search
│  │  ├─ SectionTitle · PageHeader · Breadcrumb · Reveal
│  │  ├─ ContentCard · PhilosopherCard · GameCard · ClassCard · ProjectCard
│  │  ├─ Badge · FilterChips · EmptyState · StatStars · ProfileCard
│  │  └─ PhilosopherBust · HeroArt (SVG 일러스트)
│  ├─ pages/               # 라우트별 페이지
│  ├─ utils/asset.js       # public 경로 헬퍼
│  ├─ styles/global.css
│  ├─ App.jsx              # 라우트 정의
│  └─ main.jsx
├─ .github/workflows/deploy.yml
├─ index.html
└─ vite.config.js
```

## 콘텐츠 추가 방법

모든 콘텐츠는 `src/data/` 의 JS 파일에 있습니다. 배열에 객체를 추가하면 목록·상세 페이지·검색에 자동 반영됩니다.

### 오늘의 철학 질문
`src/data/questions.js` 의 `dailyQuestions` 배열에 추가합니다. 날짜에 따라 자동 순환합니다.

```js
{ question: '질문 내용', hint: '힌트(선택)', related: ['kant'] }
```

### 철학자
`src/data/philosophers.js` 에 객체를 추가합니다. `id`는 URL(`#/philosophers/<id>`)이 됩니다.
대표 이미지는 `public/images/` 에 넣고 `image: 'images/파일명.png'` 로 지정하세요(없으면 조각상 일러스트 표시).
윤리와 사상 수업과 연결하려면 `src/data/classes.js`의 해당 그룹에 `thinker('<id>', '<이름>')`을 추가합니다.

### 수업 주제 내용 채우기
`src/data/classes.js` 의 topic 에 `sections` 를 추가하면 각 수업 구조 칸이 채워집니다. 비어 있는 칸은 "준비 중"으로 표시됩니다.

```js
sections: {
  activity: ['활동 1', '활동 2'],
  quiz: ['Q1. ...', 'Q2. ...'],
  exam: '시험 대비 핵심 정리 문장',
}
```

### 게임 & 외부 게임 연결
`src/data/games.js` 의 각 게임 `url` 에 주소를 입력하면 상태 배지가 "플레이 가능"으로 바뀌고 **플레이하기** 버튼이 활성화됩니다.

```js
{ id: 'ethics-type-test',     url: 'https://<아이디>.github.io/<심리테스트-저장소>/' }
{ id: 'philosopher-survival', url: 'https://<아이디>.github.io/philosopher-survival-game/' }
```

### 프로젝트 / 동아리 / 교사자료
- `projects.js` — `outputs`(학생 결과물), `materials`(관련 자료)의 `url` 을 채우면 링크가 활성화됩니다.
- `clubs.js` — `clubLogs` 에 `date: 'YYYY.MM.DD'` 형식으로 추가하면 최신순 타임라인에 표시됩니다. `photos` 에 이미지 경로를 넣으면 활동 사진·갤러리에 표시됩니다.
- `resources.js` — 파일을 `public/files/` 에 넣고 `fileUrl: 'files/파일명.pdf'` 를 지정하거나 외부 링크(구글 드라이브 등)를 입력합니다. `visibility: 'public' | 'teacher'`.

### 나의 철학 프로필 ↔ 심리테스트 연동
`src/data/profile.js` 에 연동 규격이 정리되어 있습니다. 심리테스트가 같은 도메인(예: `<아이디>.github.io`)에 배포되어 있다면, 결과 화면에서 아래처럼 저장하면 PHILO LAB의 프로필 카드에 자동 표시됩니다.

```js
localStorage.setItem('philolab.profile', JSON.stringify({
  source: 'ethics-type-test',
  type: 'kant',                       // 가장 닮은 철학자 id
  title: '원칙을 지키는 수호자',
  scores: [
    { key: 'utilitarianism', value: 30 },
    { key: 'deontology', value: 85 },
    { key: 'virtue', value: 55 },
    { key: 'existentialism', value: 40 },
  ],
}))
```

## 로드맵 (준비 중)

- 윤리 딜레마 · 철학자 데스매치 · 철학자 추리게임 · OX 퀴즈
- 통합사회 도구: 비교우위 게임, 기회비용 계산기, 생산가능곡선 시뮬레이터, 사회문제 선택형 활동
- 파일 업로드 · 로그인(교사 전용 자료 접근 제한)
