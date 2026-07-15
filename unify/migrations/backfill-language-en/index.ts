import {defineMigration, at, setIfMissing} from 'sanity/migrate'

/**
 * Backfill the base language on the plugin-managed document-internationalization
 * types so the i18n model is coherent before translating content.
 *
 * Verified invisible to the mobile app (no Sanity query reads `language`) and to
 * the web app (Learn queries key on `_id`/`references`, no language filter yet).
 * Idempotent: `!defined(language)` + `setIfMissing` → safe to re-run. Translation
 * documents (vi/es/hi/ar) already have a `language`, so they are skipped.
 */
export default defineMigration({
  title: 'Backfill language:en on untagged i18n base docs',
  documentTypes: ['lesson', 'module', 'submodule', 'checklist'],
  filter: '!defined(language)',
  migrate: {
    document() {
      return at('language', setIfMissing('en'))
    },
  },
})
