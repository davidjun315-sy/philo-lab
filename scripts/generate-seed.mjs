/**
 * src/data/* 의 초기 콘텐츠로 supabase/seed.sql 을 생성합니다.
 *   npm run db:seed
 * 생성된 seed.sql 을 Supabase SQL Editor 에서 실행하면 DB 에 기본 콘텐츠가 들어갑니다.
 * (이미 있는 id 는 건너뛰므로 여러 번 실행해도 관리자가 수정한 내용을 덮어쓰지 않습니다.)
 */
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

const root = fileURLToPath(new URL('..', import.meta.url))
const server = await createServer({ root, logLevel: 'error', server: { middlewareMode: true }, appType: 'custom' })

try {
  const { contentTypes, CONTENT_TYPE_KEYS, seedFor, toRow } = await server.ssrLoadModule('/src/lib/contentTypes.js')
  const { academicYears } = await server.ssrLoadModule('/src/data/clubs.js')

  const lit = (v) => {
    if (v === null || v === undefined) return 'null'
    if (typeof v === 'boolean') return v ? 'true' : 'false'
    if (typeof v === 'number') return String(v)
    if (Array.isArray(v) && v.every((x) => typeof x === 'string')) {
      return v.length ? `array[${v.map((x) => `'${x.replace(/'/g, "''")}'`).join(', ')}]::text[]` : `'{}'`
    }
    if (typeof v === 'object') return `'${JSON.stringify(v).replace(/'/g, "''")}'::jsonb`
    return `'${String(v).replace(/'/g, "''")}'`
  }

  const out = ['-- 자동 생성 파일: npm run db:seed (직접 수정하지 마세요)', 'begin;', '']

  out.push('-- 학년도')
  for (const y of academicYears) {
    out.push(`insert into public.academic_years (year, label, is_current) values (${y.year}, ${lit(y.label)}, ${y.isCurrent}) on conflict (year) do nothing;`)
  }
  out.push('', '-- 기본 학급 (현재 학년도 1~2학년 1~3반)')
  const current = academicYears.find((y) => y.isCurrent)?.year
  for (const grade of [1, 2]) {
    for (const cls of [1, 2, 3]) {
      out.push(`insert into public.classes (academic_year, grade, class_number) values (${current}, ${grade}, ${cls}) on conflict do nothing;`)
    }
  }

  // 외래키 순서: clubs → club_activities
  for (const type of CONTENT_TYPE_KEYS) {
    const { table, label } = contentTypes[type]
    out.push('', `-- ${label} (${table})`)
    for (const item of seedFor(type)) {
      const row = toRow(type, item)
      // jsonb 컬럼에 들어갈 문자열 배열(예: 빈 tools)은 jsonb 로 처리
      const cols = Object.keys(row)
      const vals = cols.map((c) => {
        const field = contentTypes[type].fields.find((f) => (f.column || f.key.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`)) === c)
        if (field?.type === 'json') return `'${JSON.stringify(row[c] ?? null).replace(/'/g, "''")}'::jsonb`
        if (field?.type === 'classes') return `'{}'::uuid[]`
        return lit(row[c])
      })
      out.push(`insert into public.${table} (${cols.join(', ')}) values (${vals.join(', ')}) on conflict (id) do nothing;`)
    }
  }
  out.push('', 'commit;', '')

  const file = fileURLToPath(new URL('../supabase/seed.sql', import.meta.url))
  writeFileSync(file, out.join('\n'))
  console.log(`seed.sql 생성 완료 (${out.length} lines)`)
} finally {
  await server.close()
}
