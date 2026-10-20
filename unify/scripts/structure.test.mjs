import assert from 'node:assert/strict'
import {readFile, writeFile, mkdtemp, unlink, rmdir} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {pathToFileURL} from 'node:url'
import {stripTypeScriptTypes} from 'node:module'
import test from 'node:test'

const source = await readFile(new URL('../structure.ts', import.meta.url), 'utf8')
const compiled = stripTypeScriptTypes(source, {mode: 'strip'})
const temporaryDirectory = await mkdtemp(join(tmpdir(), 'unify-structure-test-'))
const compiledPath = join(temporaryDirectory, 'structure.mjs')
await writeFile(compiledPath, compiled)
let structure
try {
  ;({structure} = await import(pathToFileURL(compiledPath).href))
} finally {
  await unlink(compiledPath)
  await rmdir(temporaryDirectory)
}

// Capture Structure Builder output without a browser or a Content Lake write.
function builder(kind, schemaType) {
  const node = {kind, schemaType}
  const chain = new Proxy({}, {
    get(_, method) {
      if (method === 'getId') return () => node.id || schemaType
      if (method === 'snapshot') return node
      return (...args) => {
        node[method] = args[0]
        return chain
      }
    },
  })
  return chain
}

const S = {
  list: () => builder('list'),
  listItem: () => builder('listItem'),
  document: () => builder('document'),
  divider: () => builder('divider'),
  documentTypeList: (type) => builder('documentTypeList', type),
  documentTypeListItem: (type) => builder('documentTypeListItem', type),
  initialValueTemplateItem: (id, parameters) => ({id, parameters}),
  documentTypeListItems: () =>
    ['module', 'submodule', 'lesson', 'practice', 'quiz', 'checklist', 'task', 'translation.metadata']
      .map((type) => builder('documentTypeListItem', type)),
}

const root = structure(S).snapshot
const learn = root.items[0].snapshot.child.snapshot
const courses = learn.items[0].snapshot.child.snapshot
const course = courses.child('drafts.course-123').snapshot
const modules = course.items[1].snapshot.child.snapshot
const module = modules.child('drafts.module-456').snapshot
const lessons = module.items[1].snapshot.child.snapshot

test('Learn navigation follows courses, modules, then lessons', () => {
  assert.equal(learn.title, 'Learn')
  assert.equal(courses.title, 'Courses')
  assert.equal(courses.schemaType, 'module')
  assert.equal(modules.title, 'Modules')
  assert.equal(modules.schemaType, 'submodule')
  assert.equal(lessons.title, 'Lessons')
  assert.equal(lessons.schemaType, 'lesson')
})

test('child lists use only the selected parent and normalize draft IDs', () => {
  assert.match(modules.filter, /module\._ref == \$courseId/)
  assert.deepEqual(modules.params, {courseId: 'course-123', lang: 'en'})
  assert.match(lessons.filter, /submodule\._ref == \$moduleId/)
  assert.deepEqual(lessons.params, {moduleId: 'module-456', lang: 'en'})
})

test('creation templates attach new content to the selected parent', () => {
  assert.deepEqual(modules.initialValueTemplates, [
    {id: 'module-in-course', parameters: {courseId: 'course-123'}},
  ])
  assert.deepEqual(lessons.initialValueTemplates, [
    {id: 'lesson-in-module', parameters: {moduleId: 'module-456'}},
  ])
})

test('module and lesson lists preserve lesson order and English or legacy visibility', () => {
  for (const list of [courses, modules, lessons]) {
    assert.equal(list.apiVersion, 'v2025-02-19')
    assert.match(list.filter, /language == \$lang \|\| !defined\(language\)/)
  }
  for (const list of [modules, lessons]) {
    assert.deepEqual(list.defaultOrdering, [{field: 'order', direction: 'asc'}])
  }
})

test('details stay editable and flat lists keep unassigned content accessible', () => {
  assert.equal(course.items[0].snapshot.child.snapshot.documentId, 'drafts.course-123')
  assert.equal(module.items[0].snapshot.child.snapshot.documentId, 'drafts.module-456')
  assert.ok(learn.items.some((item) => item.snapshot.title === 'All modules'))
  assert.ok(learn.items.some((item) => item.snapshot.title === 'All lessons'))
  assert.deepEqual(root.items.slice(1).map((item) => item.snapshot.schemaType).filter(Boolean),
    ['checklist', 'task'])
})
