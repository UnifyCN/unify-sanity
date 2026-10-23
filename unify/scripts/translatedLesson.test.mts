import test from 'node:test'
import assert from 'node:assert/strict'
import {translatedLessonPages} from '../lib/lessonContent.ts'
const pages = [
  {
    _key: 'page',
    order: 1,
    contentVersion: 2,
    content: [],
    sections: [
      {
        _key: 'check',
        _type: 'lessonQuickCheck',
        question: 'Question',
        options: [{_key: 'answer', text: 'Yes', correct: true}],
        explanation: 'Reason',
      },
    ],
  },
]
test('translation builds legacy text from translated sections', () => {
  const translated = structuredClone(pages)
  translated[0].sections[0].question = 'Pregunta'
  const result = translatedLessonPages(pages, translated)
  assert.equal((result[0].content as any[])[0].children[0].text, 'Pregunta')
  assert.deepEqual(result[0].sections, translated[0].sections)
})
test('translation refuses changed answer flags, page positions, and section keys', () => {
  for (const mutate of [
    (p: typeof pages) => {
      p[0].order = 2
    },
    (p: typeof pages) => {
      p[0].sections[0]._key = 'different'
    },
    (p: typeof pages) => {
      p[0].sections[0].options[0].correct = false
    },
  ]) {
    const translated = structuredClone(pages)
    mutate(translated)
    assert.throws(() => translatedLessonPages(pages, translated), /Translation changed/)
  }
})
