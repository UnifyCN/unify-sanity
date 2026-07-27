import type {StructureResolver} from 'sanity/structure'

// Types managed by @sanity/document-internationalization: filter their lists to the
// base language (English) plus legacy docs that have no language field yet, so the
// Studio lists aren't cluttered with every translated variant. Translations remain
// fully accessible via the per-document "Translations" dropdown in the editor.
const I18N_TYPES = ['module', 'submodule', 'lesson', 'checklist', 'practice', 'quiz']
const BASE_LANGUAGE = 'en'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      ...I18N_TYPES.map((type) =>
        S.documentTypeListItem(type).child(
          S.documentTypeList(type)
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
