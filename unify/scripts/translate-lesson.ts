/**
 * translate-lesson.ts
 *
 * Creates DRAFT translations of a single English lesson using Sanity Agent
 * Actions "Translate", and links them into the lesson's
 * document-internationalization `translation.metadata` group.
 *
 * Correctness properties (safe to run per-lesson across the whole catalog):
 * - Never publishes. All translations are left as drafts for human review.
 * - The metadata group is resolved FROM the source lesson via references(),
 *   never a hardcoded id. An explicit META_ID is validated to reference the
 *   source (else the script errors); if no group exists yet, one is created.
 * - Target drafts use a DETERMINISTIC id (`drafts.<sourceId>-<lang>`), so a
 *   crashed/re-run never mints duplicate drafts.
 * - The metadata update is ADDITIVE: only languages processed in this run are
 *   merged in; every other language entry is preserved untouched.
 *
 * Run from the studio dir (auth via the current `sanity login`):
 *   npx sanity exec scripts/translate-lesson.ts --with-user-token
 *
 * Optional env overrides:
 *   SCHEMA_ID   (default "_.schemas.default")
 *   SOURCE_ID   (default the "Getting Support" English lesson)
 *   META_ID     (optional; if set, MUST reference SOURCE_ID — else the script errors)
 *   LANGS       (default "vi,es,hi,ar")
 */
import {getCliClient} from 'sanity/cli'
import {createClient} from '@sanity/client'

const SCHEMA_ID = process.env.SCHEMA_ID || '_.schemas.default'
const SOURCE_ID = process.env.SOURCE_ID || 'e749df70-fad4-479c-afd7-f1318e0c0d23'

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

type TranslationRef = {
  _key: string
  _type: 'internationalizedArrayReferenceValue'
  value: {_type: 'reference'; _ref: string; _weak: true}
}

const refEntry = (lang: string, ref: string): TranslationRef => ({
  _key: lang,
  _type: 'internationalizedArrayReferenceValue',
  value: {_type: 'reference', _ref: ref, _weak: true},
})

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
  // Drafts are invisible under the default query perspective in @sanity/client v7
  // (esp. with apiVersion 'vX'); `raw` makes existence checks see drafts.
  const raw = client.withConfig({perspective: 'raw'})

  const bareSource = bare(SOURCE_ID)

  console.log(`\nProject ${cfg.projectId}/${cfg.dataset}  schema=${SCHEMA_ID}`)
  console.log(`Source lesson: ${SOURCE_ID}`)

  const source = await client.getDocument(SOURCE_ID)
  if (!source) throw new Error(`Source lesson ${SOURCE_ID} not found`)
  const sourceSlug: string | undefined = (source as any).slug?.current
  console.log(
    `Source title: "${(source as any).title}"  slug: "${sourceSlug}"  lang: ${(source as any).language}\n`,
  )

  // --- Fix #1: resolve the metadata group FROM the source (never a hardcoded id). ---
  let metaId: string | undefined = process.env.META_ID
  if (metaId) {
    const refCount = await raw.fetch<number>(
      `count(*[_id == $id && _type == "translation.metadata" && references($src)])`,
      {id: metaId, src: bareSource},
    )
    if (!refCount) {
      throw new Error(
        `META_ID "${metaId}" is not a translation.metadata group that references source ` +
          `${bareSource} — refusing to write to the wrong lesson's metadata group.`,
      )
    }
  } else {
    metaId =
      (await raw.fetch<string | null>(
        `*[_type == "translation.metadata" && references($src)][0]._id`,
        {src: bareSource},
      )) ?? undefined
  }

  // Load the group's existing translations once (raw so drafts resolve). Used both
  // to skip already-linked languages and to preserve them in the additive merge.
  const existingTranslations: TranslationRef[] = metaId
    ? (((await raw.getDocument(metaId))?.translations as TranslationRef[]) ?? [])
    : []
  const existingRef = (lang: string): string | undefined =>
    existingTranslations.find((t) => t._key === lang)?.value?._ref

  // Languages actually handled in THIS run (en + processed targets) -> bare ref.
  // Only these are rebuilt in the metadata; all other entries stay untouched.
  const processed = new Map<string, string>([['en', bareSource]])

  for (const id of TARGETS) {
    if (id === 'en') continue
    const title = ALL_LANGS[id]
    if (!title) {
      console.warn(`! Skipping unknown language "${id}" (not in ${Object.keys(ALL_LANGS).join(',')})`)
      continue
    }

    // --- Fix #2: deterministic, retry-safe target identity. ---
    const targetBaseId = `${bareSource}-${id}`
    const targetDraftId = `drafts.${targetBaseId}`

    // Guard 1: already linked in the metadata group -> preserve whatever it points
    // to (keeps pre-existing translations, incl. legacy random-id drafts).
    const linked = existingRef(id)
    if (linked) {
      console.log(`= ${id} (${title}): already linked in metadata (${linked}) — preserving`)
      processed.set(id, bare(linked))
      continue
    }

    // Guard 2: the deterministic doc already exists (crash/re-run before the
    // metadata was updated) -> reuse it, don't re-translate.
    const exists = await raw.fetch<number>(`count(*[_id in [$draft, $pub]])`, {
      draft: targetDraftId,
      pub: targetBaseId,
    })
    if (exists) {
      console.log(`= ${id} (${title}): draft ${targetDraftId} already exists — skipping translate`)
      processed.set(id, targetBaseId)
      continue
    }

    console.log(`→ ${id} (${title}): translating…`)
    const res: any = await client.agent.action.translate({
      schemaId: SCHEMA_ID,
      documentId: SOURCE_ID,
      targetDocument: {operation: 'create', _id: targetDraftId}, // deterministic UNLINKED draft
      languageFieldPath: 'language', // sets the draft's language field to `id`
      fromLanguage: FROM,
      toLanguage: {id, title},
      styleGuide: STYLE_GUIDE,
      protectedPhrases: PROTECTED_PHRASES,
    })
    const newId: string = res?._id || res?.document?._id || targetDraftId
    console.log(`  created draft ${newId}`)

    // Keep the slug identical to English (doc-i18n convention: same slug, differ by language).
    if (sourceSlug) {
      const created: any = await client.getDocument(newId)
      if (created?.slug?.current && created.slug.current !== sourceSlug) {
        await client.patch(newId).set({'slug.current': sourceSlug}).commit({visibility: 'async'})
        console.log(`  slug normalized "${created.slug.current}" -> "${sourceSlug}"`)
      }
    }

    processed.set(id, bare(newId))
  }

  // --- Fix #3: additive metadata merge — never wipe languages not in this run. ---
  const mergedByKey = new Map<string, TranslationRef>(
    existingTranslations.filter((t) => t?._key).map((t) => [t._key, t]),
  )
  for (const [lang, ref] of processed) {
    mergedByKey.set(lang, refEntry(lang, ref))
  }
  const translations = [...mergedByKey.values()]

  if (!metaId) {
    // No group existed (common for the rollout) — create one; the deterministic id
    // keeps re-runs idempotent (references($src) will then find it).
    metaId = `i18n-${bareSource}`
    await client.createIfNotExists({
      _id: metaId,
      _type: 'translation.metadata',
      schemaTypes: ['lesson'],
      translations: [],
    })
    console.log(`  created metadata group ${metaId}`)
  }
  await client
    .patch(metaId)
    .setIfMissing({schemaTypes: ['lesson']})
    .set({translations})
    .commit({visibility: 'async'})

  console.log(`\n✓ Metadata ${metaId} links: ${translations.map((t) => t._key).join(', ')}`)
  console.log('\nDRAFT translations (not published):')
  for (const id of TARGETS) {
    const ref = processed.get(id)
    if (ref && ref !== bareSource) {
      console.log(`  ${id}: drafts.${ref}  https://unify.sanity.studio/structure/lesson;${ref}`)
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
