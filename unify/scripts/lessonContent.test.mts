import test from 'node:test'
import assert from 'node:assert/strict'
import {legacyContent, migrateLesson} from '../lib/lessonContent.ts'

test('two visual fields receive stable unique legacy image keys', () => {
  const sections = ['first', 'second'].map((_key) => ({
    _key,
    _type: 'lessonVisual',
    image: {_type: 'image', asset: {_ref: `image-${_key}`}, alt: _key},
  }))
  const blocks = legacyContent(sections)
  assert.deepEqual(
    blocks.map((block) => block._key),
    ['first-image', 'second-image'],
  )
  assert.deepEqual(legacyContent(sections), blocks)
  assert.deepEqual(
    blocks.map((block) => block.asset),
    sections.map((section) => section.image.asset),
  )
})

test('migration preserves every legacy identity and is idempotent', () => {
  const content = [
    {
      _type: 'block',
      _key: 'text',
      children: [{_key: 'span', text: 'Keep these words.', marks: []}],
    },
    {_type: 'image', _key: 'photo', asset: {_ref: 'image-abc'}},
  ]
  const lesson = {
    _id: 'lesson',
    pages: [
      {_key: 'p1', order: 1, content},
      {_key: 'p2', order: 2, content: []},
    ],
    ending_pages: [{_key: 'end'}],
  }
  const migrated = migrateLesson(lesson)
  assert.deepEqual(
    migrated.pages.map((p) => p._key),
    ['p1', 'p2'],
  )
  assert.deepEqual(
    migrated.pages.map((p) => p.content),
    lesson.pages.map((p) => p.content),
  )
  assert.deepEqual(migrated.ending_pages, lesson.ending_pages)
  assert.deepEqual(legacyContent(migrated.pages[0].sections as never), content)
  assert.deepEqual(migrateLesson(migrated), migrated)
  assert.equal(lesson.pages[0].contentVersion, undefined)
})

test('new sections have readable legacy projections with working source links', () => {
  const blocks = legacyContent([
    {
      _key: 'q',
      _type: 'lessonQuickCheck',
      question: 'Question?',
      options: [{_key: 'answer', text: 'Answer', correct: true}],
      explanation: 'Reason',
    },
    {_key: 'faq', _type: 'lessonFaq', items: [{_key: 'faq1', question: 'Why?', answer: []}]},
    {
      _key: 'refs',
      _type: 'lessonCitations',
      sources: [{_key: 'ref1', title: 'Source', url: 'https://example.org'}],
    },
  ])
  assert.deepEqual(
    blocks.map((b) => b._key),
    ['q-question', 'answer', 'q-explanation', 'faq1', 'ref1'],
  )
  assert.equal(blocks[3]._type, 'dropdown')
  assert.equal((blocks[4].markDefs as {href: string}[])[0].href, 'https://example.org')
  assert.throws(() => legacyContent([{_type: 'unknown'}]), /Unsupported/)
})
