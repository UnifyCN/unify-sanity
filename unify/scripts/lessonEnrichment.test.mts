import test from 'node:test'
import assert from 'node:assert/strict'
import {registerHooks} from 'node:module'
registerHooks({resolve(specifier, context, next) {try {return next(specifier, context)} catch (error) {if (specifier.startsWith('.') && !/\.[a-z]+$/.test(specifier)) return next(`${specifier}.ts`, context); throw error}}})
const {translatedAdditions, appendLessonSections} = await import('../lib/lessonEnrichment.ts')
const block = {_key: 'original', _type: 'block', children: [{_key: 'span', _type: 'span', text: 'Texto existente', marks: []}], markDefs: [], style: 'normal'}
const additions = [{_key: 'faq', _type: 'lessonFaq', items: [{_key: 'item', _type: 'faqItem', question: 'Question?', answer: [block]}]}]
test('translated additions preserve old translated blocks and restore only new span keys', () => {
  const generated = structuredClone(additions)
  generated[0].items[0].question = 'Pregunta?'
  generated[0].items[0].answer[0].children[0]._key = 'generated'
  const translated = translatedAdditions(additions, generated)
  const page = {_key: 'page', content: [{...block, _key: 'old'}]}
  const result = appendLessonSections(page, translated)
  assert.deepEqual(result.content[0], page.content[0])
  assert.equal((translated[0].items as any[])[0].answer[0].children[0]._key, 'span')
  assert.equal((translated[0].items as any[])[0].question, 'Pregunta?')
  assert.throws(() => appendLessonSections(result, translated), /already/)
})
test('translation refuses item reordering, missing content, and changed links or answer flags', () => {
  const cases = [
    [{_key: 'a', _type: 'source', url: 'https://example.com'}],
    [{_key: 'a', _type: 'answer', text: 'Yes', correct: true}],
    [{_key: 'a', _type: 'answer', text: 'Yes', correct: true}, {_key: 'b', _type: 'answer', text: 'No', correct: false}],
  ]
  assert.throws(() => translatedAdditions(cases[0], [{...cases[0][0], url: 'https://other.com'}]), /fixed/)
  assert.throws(() => translatedAdditions(cases[1], [{...cases[1][0], correct: false}]), /fixed/)
  assert.throws(() => translatedAdditions(cases[1], [{...cases[1][0], text: ''}]), /text/)
  assert.throws(() => translatedAdditions(cases[2], [...cases[2]].reverse()), /identity/)
  assert.throws(() => translatedAdditions(cases[1], []), /length/)
})
