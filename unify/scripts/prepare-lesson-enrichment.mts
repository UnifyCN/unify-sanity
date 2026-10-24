import {readFileSync, writeFileSync} from 'node:fs'
import {legacyContent, sameContent} from '../lib/lessonContent.ts'

// Offline preparation only. The output requires a fresh revision check before publication.
const [input, editorialFile, output] = process.argv.slice(2)
if (!input || !editorialFile || !output) throw new Error('Provide export, editorial JSON, and output paths.')
const documents = readFileSync(input, 'utf8').trim().split('\n').map(line => JSON.parse(line))
const editorial = JSON.parse(readFileSync(editorialFile, 'utf8'))
const block = (key: string, text: string) => ({_key: key, _type: 'block', style: 'normal', markDefs: [], children: [{_key: `${key}-text`, _type: 'span', marks: [], text}]})
// Attribute citations by known URL prefix; an unknown source must be mapped
// here rather than silently attributed to FCAC.
const publisherFor = (url: string) => {
  if (url.startsWith('https://www.canada.ca/en/financial-consumer-agency/'))
    return 'Financial Consumer Agency of Canada'
  if (url.startsWith('https://ised-isde.canada.ca/site/office-superintendent-bankruptcy/'))
    return 'Office of the Superintendent of Bankruptcy Canada'
  throw new Error(`Unknown publisher for ${url}`)
}
const updates = editorial.lessons.map((entry: any) => {
  const doc = documents.find(doc => doc._id === entry.id)
  if (!doc || doc.language !== 'en') throw new Error(`Missing English source ${entry.id}`)
  const pages = doc.pages.map((page: any, index: number) => {
    // This batch enriches the teaching page, not the existing completion page.
    if (index !== 0) return page
    if (page.contentVersion === 2 || page.sections?.length) throw new Error(`Already structured: ${doc._id}`)
    const key = `${page._key}-v2`
    const sections = [
      {_type: 'lessonConcept', _key: `${key}-concept`, content: page.content},
      {_type: 'lessonQuickCheck', _key: `${key}-check`, question: entry.question, explanation: entry.explanation,
        options: entry.options.map((text: string, i: number) => ({_type: 'answer', _key: `${key}-answer-${i}`, text, correct: i === entry.correct}))},
      {_type: 'lessonExample', _key: `${key}-example`, theory: [block(`${key}-theory`, entry.theory)], practice: [block(`${key}-practice`, entry.practice)]},
      {_type: 'lessonFaq', _key: `${key}-faq`, items: entry.faqs.map(([question, answer]: string[], i: number) => ({_type: 'faqItem', _key: `${key}-faq-${i}`, question, answer: [block(`${key}-faq-${i}-answer`, answer)]}))},
      {_type: 'lessonCitations', _key: `${key}-citations`, sources: entry.sources.map(([title, url]: string[], i: number) => ({_type: 'source', _key: `${key}-source-${i}`, title, url, publisher: publisherFor(url)}))},
    ]
    const content = legacyContent(sections)
    if (!sameContent(content.slice(0, page.content.length), page.content)) throw new Error('Original blocks changed')
    const textWords = (value: unknown): number => {
      if (Array.isArray(value)) return value.reduce((sum, item) => sum + textWords(item), 0)
      if (!value || typeof value !== 'object') return 0
      return Object.entries(value).reduce((sum, [field, item]) => sum +
        (['text', 'question', 'explanation', 'caption'].includes(field) && typeof item === 'string'
          ? item.trim().split(/\s+/).filter(Boolean).length : textWords(item)), 0)
    }
    const words = textWords(sections)
    return {...page, contentVersion: 2, readingMinutes: Math.max(1, Math.ceil(words / 250)), sections, content}
  })
  if (!sameContent(pages.map((p: any) => p._key), doc.pages.map((p: any) => p._key))) throw new Error('Page identities changed')
  return {id: doc._id, ifRevisionId: doc._rev, title: doc.title, pages}
})
writeFileSync(output, JSON.stringify(updates, null, 2))
console.log(JSON.stringify({lessons: updates.length, teachingPages: updates.length, originalContentPreserved: true}))
