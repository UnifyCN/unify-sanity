import {legacyContent, sameContent, type ContentRecord} from './lessonContent'

const translatedFields = new Set(['text', 'question', 'explanation', 'title', 'caption'])

/** Accept translated prose only. Model output never owns stored identities or links. */
export function translatedAdditions(source: ContentRecord[], result: ContentRecord[]) {
  function visit(base: unknown, value: unknown, path: string, field = ''): unknown {
    if (Array.isArray(base)) {
      if (!Array.isArray(value) || base.length !== value.length)
        throw new Error(`Translation changed array length: ${path}`)
      return base.map((item, index) => visit(item, value[index], `${path}[${index}]`))
    }
    if (base && typeof base === 'object') {
      if (!value || typeof value !== 'object' || Array.isArray(value))
        throw new Error(`Translation removed object: ${path}`)
      const original = base as ContentRecord
      const candidate = value as ContentRecord
      // Sanity Translate regenerates span keys. These spans are new additions,
      // so restore their source keys. All other array identities must match.
      if (original._key !== candidate._key && original._type !== 'span')
        throw new Error(`Translation changed item identity: ${path}`)
      return Object.fromEntries(Object.entries(original).map(([key, item]) => {
        if (key === '_key' && original._type === 'span') return [key, item]
        if (key === 'publisher') return [key, item]
        return [key, visit(item, candidate[key], `${path}.${key}`, key)]
      }))
    }
    if (translatedFields.has(field) && typeof base === 'string') {
      if (typeof value !== 'string' || (base.trim() && !value.trim()))
        throw new Error(`Translation removed text: ${path}`)
      return value.replace(/\u2014/g, '-')
    }
    if (!sameContent(base, value)) throw new Error(`Translation changed fixed value: ${path}`)
    return base
  }
  return visit(source, result, 'sections') as ContentRecord[]
}

/** Add to a page's own language content, never to the English copy. */
export function appendLessonSections(page: ContentRecord, additions: ContentRecord[]) {
  if (page.contentVersion === 2 || Array.isArray(page.sections))
    throw new Error(`Page already has sections: ${page._key}`)
  if (!page._key || !Array.isArray(page.content) || !page.content.length)
    throw new Error('Page identity or original content is missing')
  const sections = [
    {_type: 'lessonConcept', _key: `${page._key}-v2-concept`, content: page.content},
    ...additions,
  ]
  const sectionKeys = sections.map(section => section._key)
  if (sectionKeys.some(key => !key) || new Set(sectionKeys).size !== sectionKeys.length)
    throw new Error('Section keys are missing or duplicated')
  const content = legacyContent(sections)
  if (!sameContent(content.slice(0, page.content.length), page.content))
    throw new Error('Original content changed')
  const blockKeys = content.map(block => block._key)
  if (blockKeys.some(key => !key) || new Set(blockKeys).size !== blockKeys.length)
    throw new Error('Content block keys are missing or duplicated')
  return {...page, contentVersion: 2, sections, content}
}
