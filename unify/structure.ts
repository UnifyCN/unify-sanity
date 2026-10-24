import type {StructureResolver} from 'sanity/structure'

// Keep stored type and field names stable for the mobile app and translations.
const I18N_TYPES = ['module', 'submodule', 'lesson', 'checklist', 'practice', 'quiz']
const BASE_LANGUAGE = 'en'
const LIST_API_VERSION = 'v2025-02-19'

export const structure: StructureResolver = (S) => {
  const baseLanguageFilter = '(language == $lang || !defined(language))'
  const allDocuments = (type: string, title: string) =>
    S.documentTypeListItem(type)
      .title(title)
      .child(
        S.documentTypeList(type)
          .title(title)
          .apiVersion(LIST_API_VERSION)
          .filter('_type == $type && ' + baseLanguageFilter)
          .params({type, lang: BASE_LANGUAGE}),
      )

  return S.list()
    .title('Content')
    .items([
      S.listItem()
        .id('learn')
        .title('Learn')
        .child(
          S.list()
            .title('Learn')
            .items([
              S.documentTypeListItem('module')
                .title('Courses')
                .child(
                  S.documentTypeList('module')
                    .title('Courses')
                    .apiVersion(LIST_API_VERSION)
                    .filter('_type == "module" && ' + baseLanguageFilter)
                    .params({lang: BASE_LANGUAGE})
                    .child((courseDocumentId) => {
                      const courseId = courseDocumentId.replace(/^drafts\./, '')
                      return S.list()
                        .title('Course')
                        .items([
                          S.listItem()
                            .id('course-details')
                            .title('Course details')
                            .child(S.document().schemaType('module').documentId(courseDocumentId)),
                          S.listItem()
                            .id('course-modules')
                            .title('Modules')
                            .child(
                              S.documentTypeList('submodule')
                                .title('Modules')
                                .apiVersion(LIST_API_VERSION)
                                .filter('_type == "submodule" && module._ref == $courseId && ' + baseLanguageFilter)
                                .params({courseId, lang: BASE_LANGUAGE})
                                .defaultOrdering([{field: 'order', direction: 'asc'}])
                                .initialValueTemplates([
                                  S.initialValueTemplateItem('module-in-course', {courseId}),
                                ])
                                .child((moduleDocumentId) => {
                                  const moduleId = moduleDocumentId.replace(/^drafts\./, '')
                                  return S.list()
                                    .title('Module')
                                    .items([
                                      S.listItem()
                                        .id('module-details')
                                        .title('Module details')
                                        .child(S.document().schemaType('submodule').documentId(moduleDocumentId)),
                                      S.listItem()
                                        .id('module-lessons')
                                        .title('Lessons')
                                        .child(
                                          S.documentTypeList('lesson')
                                            .title('Lessons')
                                            .apiVersion(LIST_API_VERSION)
                                            .filter('_type == "lesson" && submodule._ref == $moduleId && ' + baseLanguageFilter)
                                            .params({moduleId, lang: BASE_LANGUAGE})
                                            .defaultOrdering([{field: 'order', direction: 'asc'}])
                                            .initialValueTemplates([
                                              S.initialValueTemplateItem('lesson-in-module', {moduleId}),
                                            ]),
                                        ),
                                    ])
                                }),
                            ),
                        ])
                    }),
                ),
              S.divider(),
              allDocuments('submodule', 'All modules'),
              allDocuments('lesson', 'All lessons'),
              allDocuments('practice', 'Practice'),
              allDocuments('quiz', 'Quizzes'),
            ]),
        ),
      allDocuments('checklist', 'Checklists'),
      S.divider(),
      ...S.documentTypeListItems().filter((item) => {
        const id = item.getId()
        return !!id && ![...I18N_TYPES, 'translation.metadata'].includes(id)
      }),
    ])
}
