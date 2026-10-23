/**
 * 통합 검색 인덱스 — 현재 사용자에게 보이는 콘텐츠(useContent)로 만들어집니다.
 * 새 콘텐츠 종류를 검색에 넣으려면 아래 배열에 항목 생성 규칙을 추가하세요.
 */
export const buildSearchIndex = (c) => [
  ...c.philosophers.map((p) => ({
    type: '철학자',
    title: p.name,
    subtitle: `${p.region} · ${p.era} · ${p.school || ''}`,
    keywords: [p.nameEn, ...p.keywords, p.quote].join(' '),
    to: `/philosophers/${p.id}`,
  })),
  ...c.subjects.flatMap((s) => [
    { type: '수업', title: s.name, subtitle: s.description, keywords: s.nameEn, to: `/classes/${s.id}` },
    ...s.groups.flatMap((g) =>
      g.topics.map((t) => ({
        type: '수업',
        title: `${g.title} - ${t.name}`,
        subtitle: s.name,
        keywords: [t.name, t.summary, ...(t.questions || []), c.getPhilosopher(t.philosopherId)?.keywords?.join(' ')].join(' '),
        to: `/classes/${s.id}/${t.id}`,
      })),
    ),
  ]),
  ...c.games.map((g) => ({
    type: '게임',
    title: g.title,
    subtitle: g.tagline,
    keywords: [g.type, ...g.philosophers.map((id) => c.getPhilosopher(id)?.name || '')].join(' '),
    to: `/games/${g.id}`,
  })),
  ...c.philosophers.flatMap((p) =>
    p.dilemmas.map((d) => ({ type: '딜레마', title: d, subtitle: `${p.name}의 관점`, keywords: p.name, to: `/philosophers/${p.id}` })),
  ),
  ...c.projects.map((p) => ({
    type: '프로젝트',
    title: p.title,
    subtitle: p.category,
    keywords: [...p.coreQuestions, ...p.philosophers.map((id) => c.getPhilosopher(id)?.name || '')].join(' '),
    to: `/projects/${p.id}`,
  })),
  ...c.clubActivities.map((l) => ({
    type: '동아리',
    title: l.title,
    subtitle: `${l.date} · ${c.getClub(l.clubId)?.name || ''}`,
    keywords: l.description,
    to: `/club/${c.getClub(l.clubId)?.academicYear || ''}/${l.clubId}`,
  })),
  ...c.resources.map((r) => ({
    type: '교사자료',
    title: r.title,
    subtitle: `${r.category} · ${r.subject || ''}`,
    keywords: [r.description, ...r.philosophers.map((id) => c.getPhilosopher(id)?.name || '')].join(' '),
    to: '/resources',
  })),
]

export const searchSite = (index, query, limit = 14) => {
  const q = query.trim().toLowerCase()
  if (!q) return []
  return index
    .map((item) => {
      const title = item.title.toLowerCase()
      const rest = `${item.subtitle} ${item.keywords}`.toLowerCase()
      const score = title.startsWith(q) ? 3 : title.includes(q) ? 2 : rest.includes(q) ? 1 : 0
      return { item, score }
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((r) => r.item)
}
