export type ContentRecord = {_key?: string; _type?: string; [key: string]: unknown}
const textBlock = (key: string, text: string, href?: string): ContentRecord => ({
  _key: key,
  _type: 'block',
  style: 'normal',
  children: [{_key: `${key}-span`, _type: 'span', text, marks: href ? ['source'] : []}],
  markDefs: href ? [{_key: 'source', _type: 'link', href}] : [],
})
const array = (value: unknown): ContentRecord[] => (Array.isArray(value) ? value : [])

/** Keep the legacy reader usable. Never replace the source sections with this projection. */
export function legacyContent(sections: ContentRecord[]): ContentRecord[] {
  return sections.flatMap((section) => {
    const key = section._key ?? 'section'
    switch (section._type) {
      case 'lessonConcept':
        return array(section.content)
      case 'lessonExample':
        return [...array(section.theory), ...array(section.practice)]
      case 'lessonVisual':
        return [
          ...array(section.content),
          ...(section.image
            ? [
                {
                  ...(section.image as ContentRecord),
                  _key: (section.image as ContentRecord)._key || `${key}-image`,
                },
              ]
            : []),
          ...(section.caption ? [textBlock(`${key}-caption`, String(section.caption))] : []),
        ].filter(Boolean)
      case 'lessonFaq':
        return array(section.items).map((item) => ({
          _type: 'dropdown',
          _key: item._key,
          label: item.question,
          content: item.answer,
        }))
      case 'lessonCitations':
        return array(section.sources).map((source) =>
          textBlock(
            source._key!,
            [source.publisher, source.year, source.title].filter(Boolean).join(' · '),
            String(source.url),
          ),
        )
      case 'lessonQuickCheck':
        return [
          textBlock(`${key}-question`, String(section.question)),
          ...array(section.options).map((option) => textBlock(option._key!, String(option.text))),
          textBlock(`${key}-explanation`, String(section.explanation)),
        ]
      default:
        throw new Error(`Unsupported section type: ${section._type}`)
    }
  })
}

/** Add structure without changing pages, content, text, spans, or keys. */
export function migrateLesson<T extends {_id?: string; pages?: ContentRecord[]}>(lesson: T): T {
  return {
    ...lesson,
    pages: lesson.pages?.map((page) => {
      if (page.contentVersion === 2 || !array(page.content).length) return page
      return {
        ...page,
        contentVersion: 2,
        sections: [{_type: 'lessonConcept', _key: `${page._key}-concept`, content: page.content}],
      }
    }),
  }
}

export function sameContent(a: unknown, b: unknown): boolean {
  function canonical(value: unknown): unknown {
    if (Array.isArray(value)) return value.map(canonical)
    if (value && typeof value === 'object')
      return Object.fromEntries(
        Object.entries(value)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([key, item]) => [key, canonical(item)]),
      )
    return value
  }
  return JSON.stringify(canonical(a)) === JSON.stringify(canonical(b))
}

const identityFields = new Set(['_key', '_type', '_ref', 'url', 'href', 'slug'])

/** Reject structural changes from automated translation before linking the draft. */
export function translatedLessonPages(source: ContentRecord[], translated: ContentRecord[]) {
  function check(base: unknown, target: unknown, path: string): void {
    if (Array.isArray(base)) {
      if (!Array.isArray(target) || base.length !== target.length)
        throw new Error(`Translation changed array structure: ${path}`)
      base.forEach((item, index) => check(item, target[index], `${path}[${index}]`))
    } else if (base && typeof base === 'object') {
      if (!target || typeof target !== 'object' || Array.isArray(target))
        throw new Error(`Translation removed an object: ${path}`)
      const other = target as Record<string, unknown>
      for (const [key, value] of Object.entries(base)) {
        if (identityFields.has(key) && JSON.stringify(value) !== JSON.stringify(other[key]))
          throw new Error(`Translation changed identity: ${path}.${key}`)
        check(value, other[key], `${path}.${key}`)
      }
    } else if ((typeof base === 'number' || typeof base === 'boolean') && base !== target) {
      throw new Error(`Translation changed a value: ${path}`)
    }
  }
  check(source, translated, 'pages')
  return translated.map((page) =>
    page.contentVersion === 2 && Array.isArray(page.sections)
      ? {...page, content: legacyContent(page.sections)}
      : page,
  )
}
