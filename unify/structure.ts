import type {StructureResolver} from 'sanity/structure'

// Types managed by @sanity/document-internationalization: filter their lists to the
// base language (English) plus legacy docs that have no language field yet, so the
// Studio lists aren't cluttered with every translated variant. Translations remain
// fully accessible via the per-document "Translations" dropdown in the editor.
const I18N_TYPES = ['module', 'submodule', 'lesson', 'checklist', 'practice', 'quiz']
const BASE_LANGUAGE = 'en'
// Required by the Structure API whenever a list uses a custom filter; without it
// the Studio logs a deprecation warning once per type. Pinned to the version in
// Sanity's own guidance for this warning rather than "today", so the list-query
// semantics are a known value. https://www.sanity.io/docs/help/structure-api-version-required-for-custom-filter
const LIST_API_VERSION = 'v2025-02-19'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      ...I18N_TYPES.map((type) =>
        S.documentTypeListItem(type).child(
          S.documentTypeList(type)
            .apiVersion(LIST_API_VERSION)
            .filter('_type == $type && (language == $lang || !defined(language))')
            .params({type, lang: BASE_LANGUAGE}),
        ),
      ),
      S.divider(),
      // Everything else (task) as default lists; hide the i18n types (handled
      // above) and the plugin's internal translation.metadata documents.
      ...S.documentTypeListItems().filter((item) => {
        const id = item.getId()
        return !!id && ![...I18N_TYPES, 'translation.metadata'].includes(id)
      }),
    ])
