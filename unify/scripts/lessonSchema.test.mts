import test from 'node:test'
import assert from 'node:assert/strict'
import {registerHooks} from 'node:module'
import {createSchema, validateDocument} from 'sanity'
import {legacyContent} from '../lib/lessonContent.ts'

// Resolve the Studio's extensionless TypeScript imports in Node's test runner.
registerHooks({
  resolve(specifier, context, next) {
    try {
      return next(specifier, context)
    } catch (error) {
      if (specifier.startsWith('.') && !/\.[a-z]+$/.test(specifier))
        return next(`${specifier}.ts`, context)
      throw error
    }
  },
})
// Sanity schedules validators through browser timers, including in CLI mode.
Object.assign(globalThis, {window: {setTimeout, clearTimeout}})
const {structuredLessonFields} = await import('../schemaTypes/lessonSections.ts')
const schema = createSchema({
  name: 'test',
  types: [
    {
      name: 'lesson',
      type: 'document',
      fields: [
        ...structuredLessonFields([{type: 'block'}]),
        {name: 'content', type: 'array', of: [{type: 'block'}, {type: 'image'}]},
      ],
    },
  ],
})

test('the real Studio schema accepts two Visual sections without optional introduction text', async () => {
  const sections = ['first', 'second'].map((_key) => ({
    _key,
    _type: 'lessonVisual',
    image: {
      _type: 'image',
      alt: 'A sample diagram',
      asset: {
        _type: 'reference',
        _ref: 'image-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa-100x100-png',
      },
    },
  }))
  const document = {
    _id: 'test',
    _type: 'lesson',
    _rev: 'test',
    _createdAt: '2026-10-21T00:00:00Z',
    _updatedAt: '2026-10-21T00:00:00Z',
    contentVersion: 2,
    sections,
    content: legacyContent(sections),
  }
  const markers = await validateDocument({
    document,
    workspace: {schema} as never,
    environment: 'cli',
    getDocumentExists: async () => true,
  })
  assert.deepEqual(
    markers.filter((marker) => marker.level === 'error'),
    [],
  )
  const missingAlt = structuredClone(document)
  delete (missingAlt.sections[0].image as {alt?: string}).alt
  missingAlt.content = legacyContent(missingAlt.sections)
  const invalid = await validateDocument({
    document: missingAlt,
    workspace: {schema} as never,
    environment: 'cli',
    getDocumentExists: async () => true,
  })
  assert(invalid.some((marker) => marker.level === 'error' && marker.path.includes('alt')))
})
