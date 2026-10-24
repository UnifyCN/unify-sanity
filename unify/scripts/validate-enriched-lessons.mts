import {readFileSync} from 'node:fs'
import {registerHooks} from 'node:module'
import {createSchema, validateDocument} from 'sanity'
registerHooks({resolve(specifier, context, next) {try {return next(specifier, context)} catch (error) {if (specifier.startsWith('.') && !/\.[a-z]+$/.test(specifier)) return next(`${specifier}.ts`, context); throw error}}})
Object.assign(globalThis, {window: {setTimeout, clearTimeout}})
const {default: lesson} = await import('../schemaTypes/lesson.ts')
const schema = createSchema({name: 'learn-validation', types: [{...lesson, fields: lesson.fields.filter(field => field.name === 'pages')}]})
const source = readFileSync(process.argv[2], 'utf8').trim().split('\n').map(line => JSON.parse(line))
const updates = JSON.parse(readFileSync(process.argv[3], 'utf8'))
let errors = 0
for (const update of updates) {
  const original = source.find(doc => doc._id === update.id)
  const document = {_id: original._id, _type: original._type, _rev: original._rev, _createdAt: original._createdAt, _updatedAt: original._updatedAt, pages: update.pages}
  const markers = await validateDocument({document, workspace: {schema} as never, environment: 'cli', getDocumentExists: async () => true})
  const failures = markers.filter(marker => marker.level === 'error')
  errors += failures.length
  console.log(JSON.stringify({id: update.id, errors: failures.map(marker => ({path: marker.path, message: marker.message}))}))
}
if (errors) process.exitCode = 1
