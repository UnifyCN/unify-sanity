import {defineMigration, at, setIfMissing} from 'sanity/migrate'

/**
 * Backfill the base language on the plugin-managed document-internationalization
 * types so the i18n model is coherent before translating content.
 *
 * Verified invisible to the mobile app (no Sanity query reads `language`) and to
 * the web app (Learn queries key on `_id`/`references`; the language-filtered
 * queries all tolerate `!defined(language)`).
 * Idempotent: `!defined(language)` + `setIfMissing` → safe to re-run. Translation
 * documents (vi/es/hi/ar) already have a `language`, so they are skipped.
 *
 * `practice` and `quiz` were added when those types joined the plugin — their
 * base docs were the only untagged ones left, so a re-run touches just those.
 */
export default defineMigration({
  title: 'Backfill language:en on untagged i18n base docs',
  documentTypes: ['lesson', 'module', 'submodule', 'checklist', 'practice', 'quiz'],
  filter: '!defined(language)',
  migrate: {
    document() {
      return at('language', setIfMissing('en'))
    },
  },
})
