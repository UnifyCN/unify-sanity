import {readFile, writeFile} from 'node:fs/promises'
import {migrateLesson} from '../lib/lessonContent.ts'

// Input is an exported NDJSON dataset. Output contains guarded, additive patches only.
const [input, output] = process.argv.slice(2)
if (!input || !output)
  throw new Error(
    'Usage: node --experimental-strip-types scripts/migrate-lesson-sections.mts export.ndjson patches.json',
  )
const documents = (await readFile(input, 'utf8'))
  .split('\n')
  .filter(Boolean)
  .map((line) => JSON.parse(line))
const mutations = []
for (const doc of documents) {
  if (doc._type !== 'lesson' || !Array.isArray(doc.pages)) continue
  if (!doc._rev) throw new Error(`Missing revision: ${doc._id}`)
  const migrated = migrateLesson(doc)
  const set: Record<string, unknown> = {}
  doc.pages.forEach(
    (page: {_key?: string; sections?: unknown; contentVersion?: number}, index: number) => {
      if (page.contentVersion === 2 || !migrated.pages[index].sections) return
      if (!page._key || !/^[a-zA-Z0-9_-]+$/.test(page._key))
        throw new Error(`Invalid page key: ${doc._id}`)
      if (page.sections) throw new Error(`Existing unversioned sections require review: ${doc._id}`)
      const path = `pages[_key==${JSON.stringify(page._key)}]`
      set[`${path}.contentVersion`] = 2
      set[`${path}.sections`] = migrated.pages[index].sections
    },
  )
  if (Object.keys(set).length) mutations.push({patch: {id: doc._id, ifRevisionID: doc._rev, set}})
}
await writeFile(output, JSON.stringify({mutations}, null, 2) + '\n')
console.log(
  JSON.stringify({
    documents: documents.length,
    changedLessons: mutations.length,
    changedPages: mutations.reduce((n, m) => n + Object.keys(m.patch.set).length / 2, 0),
    output,
    applied: false,
  }),
)
