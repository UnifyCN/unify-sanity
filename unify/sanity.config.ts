import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import {colorInput} from '@sanity/color-input'
import {documentInternationalization} from '@sanity/document-internationalization'
import {assist} from '@sanity/assist'
import {structure} from './structure'

export default defineConfig({
  name: 'default',
  title: 'Unify',

  projectId: 'fercgabp',
  dataset: 'production',

  plugins: [
    structureTool({structure}),
    visionTool(),
    colorInput(),
    // Document-level i18n: each translatable doc gets a `language` field and
    // per-language document variants linked by a translation.metadata doc.
    documentInternationalization({
      supportedLanguages: [
        {id: 'en', title: 'English'},
        {id: 'vi', title: 'Vietnamese'},
        {id: 'es', title: 'Spanish'},
        {id: 'hi', title: 'Hindi'},
        {id: 'ar', title: 'Arabic'},
        {id: 'fr-CA', title: 'French (Canada)'},
      ],
      schemaTypes: ['module', 'submodule', 'lesson', 'checklist', 'practice', 'quiz'],
    }),
    // AI Assist: enables the document-level "Translate" action, keyed off the
    // same `language` field the plugin above manages.
    assist({
      translate: {
        document: {
          languageField: 'language',
        },
      },
    }),
  ],

  schema: {
    types: schemaTypes,
  },
})
