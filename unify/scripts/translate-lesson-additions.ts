/** Prepare translations locally. This command never writes to Sanity. */
import {getCliClient} from 'sanity/cli'
import {mkdirSync, readFileSync, existsSync, writeFileSync} from 'node:fs'
import {join} from 'node:path'
import {createHash} from 'node:crypto'
import {appendLessonSections, translatedAdditions} from '../lib/lessonEnrichment'
import {type ContentRecord} from '../lib/lessonContent'

const languages: Record<string, string> = {
  es: 'Spanish', 'fr-CA': 'Canadian French', ar: 'Arabic',
  hi: 'Hindi', pa: 'Punjabi (Gurmukhi script)', vi: 'Vietnamese',
}
async function main() {
  const input = process.env.LESSON_EXPORT
  const output = process.env.LESSON_OUTPUT
  const ids = process.env.LESSON_IDS?.split(',').filter(Boolean)
  if (!input || !output || !ids?.length) throw new Error('Set LESSON_EXPORT, LESSON_OUTPUT, LESSON_IDS')
  const outputDirectory = output
  const documents = readFileSync(input, 'utf8').trim().split('\n').map(line => JSON.parse(line))
  const client = getCliClient().withConfig({apiVersion: 'vX', useCdn: false, perspective: 'raw'})
  if (client.config().projectId !== 'fercgabp' || client.config().dataset !== 'production')
    throw new Error('Wrong Sanity project or dataset')
  mkdirSync(output, {recursive: true})
  const jobs = ids.flatMap(id => Object.entries(languages).map(([language, title]) => ({id, language, title})))
  let cursor = 0
  let failures = 0
  async function worker() {
    while (cursor < jobs.length) {
      const {id, language, title} = jobs[cursor++]
      const targetId = `${id}-${language}`
      try {
        const source = documents.find(doc => doc._id === id && doc.language === 'en')
        const target = documents.find(doc => doc._id === targetId && doc.language === language)
        if (!source || !target) throw new Error('Missing source or existing translation')
        if (documents.some(doc => doc._id === `drafts.${targetId}`)) throw new Error('Existing draft requires separate review')
        const hash = createHash('sha256').update(JSON.stringify([source, target])).digest('hex')
        const file = join(outputDirectory, `${targetId}.json`)
        if (existsSync(file) && JSON.parse(readFileSync(file, 'utf8')).inputHash === hash) {
          console.log(JSON.stringify({id: targetId, state: 'cached'})); continue
        }
        const pages: ContentRecord[] = structuredClone(target.pages)
        for (const sourcePage of source.pages) {
          if (sourcePage.contentVersion !== 2) continue
          const index = pages.findIndex(page => page._key === sourcePage._key)
          if (index < 0) throw new Error(`Translated page key differs: ${sourcePage._key}`)
          const additions = sourcePage.sections.filter((section: ContentRecord) => section._type !== 'lessonConcept')
          if (!additions.length) continue
          if (pages[index].contentVersion === 2) throw new Error('Target is already structured')
          const result: any = await client.agent.action.translate({
            schemaId: '_.schemas.default', documentId: id, noWrite: true,
            fromLanguage: {id: 'en', title: 'English'}, toLanguage: {id: language, title},
            target: {path: ['pages', {_key: sourcePage._key}, 'sections'], maxPathDepth: 12,
              exclude: sourcePage.sections.filter((s: ContentRecord) => s._type === 'lessonConcept').map((s: ContentRecord) => ({_key: s._key!}))},
            conditionalPaths: {defaultHidden: false},
            styleGuide: 'Translate only the selected new sections into clear language for newcomers. Preserve all array keys, order, types, links, references, numbers, currencies, and correct-answer booleans. Do not add or remove any content. Keep official publisher and organization names unchanged. Do not use an em dash.',
          })
          const translated = result.pages?.find((page: ContentRecord) => page._key === sourcePage._key)?.sections
            ?.filter((section: ContentRecord) => section._type !== 'lessonConcept')
          if (!translated) throw new Error('Missing translated sections')
          pages[index] = appendLessonSections(pages[index], translatedAdditions(additions, translated))
        }
        writeFileSync(file, JSON.stringify({id: targetId, ifRevisionId: target._rev,
          sourceId: id, sourceRevision: source._rev, inputHash: hash, title: target.title, language, pages}, null, 2))
        console.log(JSON.stringify({id: targetId, state: 'prepared'}))
      } catch (error) {
        failures++
        console.error(JSON.stringify({id: targetId, state: 'failed', message: (error as Error).message}))
      }
    }
  }
  await Promise.all([worker(), worker(), worker()])
  console.log(JSON.stringify({jobs: jobs.length, failures, hostedWrites: 0}))
  if (failures) process.exitCode = 1
}
main().catch(error => {console.error(error.message); process.exitCode = 1})
