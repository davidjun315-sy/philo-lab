/** 사이트 전체 검색 인덱스 — 각 데이터 파일에서 자동으로 생성됩니다. */
import { philosophers } from './philosophers'
import { games } from './games'
import { subjects } from './classes'
import { projects } from './projects'
import { clubLogs } from './clubs'
import { resources } from './resources'

export const searchIndex = [
  ...philosophers.map((p) => ({
    type: '철학자',
    title: p.name,
    subtitle: `${p.region} · ${p.era} · ${p.school}`,
    keywords: [p.nameEn, ...p.keywords, p.quote].join(' '),
    to: `/philosophers/${p.id}`,
  })),
  ...games.map((g) => ({
    type: '게임',
    title: g.title,
    subtitle: g.tagline,
    keywords: g.category,
    to: `/games/${g.id}`,
  })),
  ...subjects.flatMap((s) => [
    { type: '수업', title: s.name, subtitle: s.description, keywords: s.nameEn, to: `/classes/${s.id}` },
    ...s.groups.flatMap((g) =>
      g.topics.map((t) => ({
        type: '수업',
        title: `${t.name}`,
        subtitle: `${s.name} · ${g.title}`,
        keywords: [t.summary, ...(t.questions || [])].join(' '),
        to: `/classes/${s.id}/${t.id}`,
      })),
    ),
  ]),
  ...projects.map((p) => ({
    type: '프로젝트',
    title: p.title,
    subtitle: p.category,
    keywords: p.coreQuestions.join(' '),
    to: `/projects/${p.id}`,
  })),
  ...clubLogs.map((l) => ({
    type: '동아리',
    title: l.title,
    subtitle: `${l.date} · ${l.type}`,
    keywords: l.summary,
    to: '/club',
  })),
  ...resources.map((r) => ({
    type: '교사자료',
    title: r.title,
    subtitle: `${r.category} · ${r.subject}`,
    keywords: r.description,
    to: '/resources',
  })),
]

export const searchSite = (query, limit = 12) => {
  const q = query.trim().toLowerCase()
  if (!q) return []
  return searchIndex
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
