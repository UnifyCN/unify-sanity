/**
 * translate-lesson.ts
 *
 * Creates DRAFT translations (Vietnamese, Spanish, Hindi) of a single English
 * lesson using Sanity Agent Actions "Translate", and links them into the
 * lesson's document-internationalization `translation.metadata` group.
 *
 * - Never publishes. All translations are left as drafts for human review.
 * - Idempotent: skips a language whose draft translation already exists.
 *
 * Run from the studio dir (auth via the current `sanity login`):
 *   npx sanity exec scripts/translate-lesson.ts --with-user-token
 *
 * Optional env overrides:
 *   SCHEMA_ID   (default "_.schemas.default")
 *   SOURCE_ID   (default the "Getting Support" English lesson)
 *   META_ID     (default that lesson's translation.metadata group)
 *   LANGS       (default "vi,es,hi")
 */
import {getCliClient} from 'sanity/cli'
import {createClient} from '@sanity/client'

const SCHEMA_ID = process.env.SCHEMA_ID || '_.schemas.default'
const SOURCE_ID = process.env.SOURCE_ID || 'e749df70-fad4-479c-afd7-f1318e0c0d23'
const META_ID = process.env.META_ID || 'ac9369a6-ee50-4cb9-a5ff-aa52a9655d07'

const ALL_LANGS: Record<string, string> = {
  vi: 'Vietnamese',
  es: 'Spanish',
  hi: 'Hindi',
  ar: 'Arabic',
}
const TARGETS = (process.env.LANGS || 'vi,es,hi,ar')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)

const FROM = {id: 'en', title: 'English'}

// Keep brand / proper nouns, org + program names, phone numbers and URLs intact.
const PROTECTED_PHRASES = ['Unify', 'Canada', 'British Columbia']
const STYLE_GUIDE =
  'Translate content for newcomers settling in Canada. Keep organization names, ' +
  'program names, helpline/service names, phone numbers, and URLs exactly as they ' +
  'appear in the source (do not translate or localize them). Use clear, simple, ' +
  'warm, respectful language a newcomer can easily understand.'

const bare = (id: string) => id.replace(/^drafts\./, '')

async function main() {
  // Build a v-X-capable client from the CLI auth (token comes from --with-user-token).
  const cli = getCliClient()
  const cfg = cli.config()
  if (!cfg.token) {
    throw new Error(
      'No auth token available. Run with:  npx sanity exec scripts/translate-lesson.ts --with-user-token',
    )
  }
  const client = createClient({
    projectId: cfg.projectId,
    dataset: cfg.dataset,
    apiVersion: 'vX', // required for Agent Actions
    token: cfg.token,
    useCdn: false,
  })

  console.log(`\nProject ${cfg.projectId}/${cfg.dataset}  schema=${SCHEMA_ID}`)
  console.log(`Source lesson: ${SOURCE_ID}`)

  const source = await client.getDocument(SOURCE_ID)
  if (!source) throw new Error(`Source lesson ${SOURCE_ID} not found`)
  const sourceSlug: string | undefined = (source as any).slug?.current
  console.log(`Source title: "${(source as any).title}"  slug: "${sourceSlug}"  lang: ${(source as any).language}\n`)

  // language -> bare doc id, for the final metadata rebuild. Seed with English.
  const linked: Record<string, string> = {en: bare(SOURCE_ID)}

  for (const id of TARGETS) {
    const title = ALL_LANGS[id]
    if (!title) {
      console.warn(`! Skipping unknown language "${id}" (not in ${Object.keys(ALL_LANGS).join(',')})`)
      continue
    }

    // Idempotency guard: a draft (or published) translation for this language + slug already?
    // Use the `raw` perspective so DRAFTS are visible — the default query perspective in
    // @sanity/client v7 (esp. with apiVersion 'vX') excludes drafts, which would make this
    // guard miss existing draft translations and create duplicates.
    const existing: {_id: string} | null = await client.withConfig({perspective: 'raw'}).fetch(
      `*[_type == "lesson" && language == $lang && slug.current == $slug][0]{_id}`,
      {lang: id, slug: sourceSlug},
    )
    if (existing?._id) {
      console.log(`= ${id} (${title}): already exists (${existing._id}) — skipping translate, will relink`)
      linked[id] = bare(existing._id)
      continue
    }

    console.log(`→ ${id} (${title}): translating…`)
    const res: any = await client.agent.action.translate({
      schemaId: SCHEMA_ID,
      documentId: SOURCE_ID,
      targetDocument: {operation: 'create'}, // new UNLINKED draft
      languageFieldPath: 'language', // sets the draft's language field to `id`
      fromLanguage: FROM,
      toLanguage: {id, title},
      styleGuide: STYLE_GUIDE,
      protectedPhrases: PROTECTED_PHRASES,
    })

    const newId: string | undefined = res?._id || res?.document?._id
    if (!newId) {
      console.error(`! ${id}: translate returned no _id. Raw:`, JSON.stringify(res).slice(0, 500))
      continue
    }
    console.log(`  created draft ${newId}`)

    // Keep the slug identical to English (doc-i18n convention: same slug, differ by language).
    if (sourceSlug) {
      const created: any = await client.getDocument(newId)
      if (created?.slug?.current && created.slug.current !== sourceSlug) {
        await client.patch(newId).set({'slug.current': sourceSlug}).commit({visibility: 'async'})
        console.log(`  slug normalized "${created.slug.current}" -> "${sourceSlug}"`)
      }
    }

    linked[id] = bare(newId)
  }

  // Rebuild the metadata group's translations from what we actually have linked.
  const order = ['en', ...TARGETS]
  const translations = order
    .filter((k) => linked[k])
    .map((k) => ({
      _key: k,
      _type: 'internationalizedArrayReferenceValue',
      value: {_type: 'reference', _ref: linked[k], _weak: true},
    }))

  await client
    .patch(META_ID)
    .setIfMissing({schemaTypes: ['lesson']})
    .set({translations})
    .commit({visibility: 'async'})

  console.log(`\n✓ Metadata ${META_ID} now links: ${order.filter((k) => linked[k]).join(', ')}`)
  console.log('\nCreated/updated DRAFTS (not published):')
  for (const id of TARGETS) {
    if (linked[id] && linked[id] !== bare(SOURCE_ID)) {
      console.log(
        `  ${id}: drafts.${linked[id]}  ` +
          `https://unify.sanity.studio/structure/lesson;${linked[id]}`,
      )
    }
  }
  console.log('\nReview in the Studio, then publish manually. Do NOT publish until the web app')
  console.log('filters Learn queries by `language` (else translations show as duplicate lessons).')
}

main().then(
  () => process.exit(0),
  (err) => {
    console.error('\n✗ translate-lesson failed:', err?.message || err)
    if (err?.response?.body) console.error(JSON.stringify(err.response.body).slice(0, 800))
    process.exit(1)
  },
)
