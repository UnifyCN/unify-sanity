import {defineField, type ArrayOfType, type Rule} from 'sanity'
import {legacyContent, sameContent, type ContentRecord} from '../lib/lessonContent'

export function structuredLessonFields(contentTypes: ArrayOfType[]) {
  const rich = (name: string, title: string, optional = false) => ({
    name,
    title,
    type: 'array',
    of: contentTypes,
    validation: (rule: Rule) => (optional ? rule : rule.required()),
  })
  const title = {name: 'title', title: 'Section label (optional)', type: 'string'}
  const required = (rule: Rule) => rule.required()
  return [
    defineField({
      name: 'contentVersion',
      title: 'Reader format',
      type: 'number',
      options: {
        list: [
          {title: 'Legacy', value: 1},
          {title: 'Structured', value: 2},
        ],
      },
      initialValue: 2,
    }),
    defineField({
      name: 'readingMinutes',
      title: 'Reading time (minutes)',
      type: 'number',
      validation: (rule) => rule.integer().min(1),
    }),
    defineField({
      name: 'sections',
      title: 'Lesson sections',
      type: 'array',
      description:
        'Use Concept, Example, Quick check, Visual, FAQ, and Citations. Keep existing page and block keys. Use Sync legacy content before publishing.',
      hidden: ({parent}) => parent?.contentVersion !== 2,
      validation: (rule) =>
        rule.custom((value, context) => {
          const page = context.parent as ContentRecord | undefined
          if (page?.contentVersion !== 2) return true
          if (!Array.isArray(value) || value.length === 0) return 'Add at least one section.'
          const projected = legacyContent(value as ContentRecord[])
          if (!sameContent(projected, page.content))
            return 'Run the Sync legacy content document action before publishing.'
          const keys = projected.map((block) => block._key)
          if (new Set(keys).size !== keys.length)
            return 'Content block keys must be unique across this page.'
          return true
        }),
      of: [
        {
          name: 'lessonConcept',
          title: 'Concept',
          type: 'object',
          fields: [title, rich('content', 'Content')],
        },
        {
          name: 'lessonExample',
          title: 'Example',
          type: 'object',
          fields: [title, rich('theory', 'Theory'), rich('practice', 'In practice')],
        },
        {
          name: 'lessonVisual',
          title: 'Visual example',
          type: 'object',
          fields: [
            title,
            {
              name: 'image',
              type: 'image',
              validation: required,
              fields: [
                {name: 'alt', type: 'string', title: 'Alternative text', validation: required},
              ],
            },
            rich('content', 'Introduction', true),
            {name: 'caption', type: 'string'},
          ],
        },
        {
          name: 'lessonQuickCheck',
          title: 'Quick check',
          type: 'object',
          fields: [
            title,
            {name: 'question', type: 'text', validation: required},
            {
              name: 'options',
              type: 'array',
              validation: (rule: Rule) =>
                rule
                  .required()
                  .min(2)
                  .custom((value) =>
                    Array.isArray(value) &&
                    value.filter((option: {correct?: boolean}) => option.correct).length === 1
                      ? true
                      : 'Select exactly one correct answer.',
                  ),
              of: [
                {
                  type: 'object',
                  name: 'answer',
                  fields: [
                    {name: 'text', type: 'string', validation: required},
                    {name: 'correct', type: 'boolean', initialValue: false},
                  ],
                },
              ],
            },
            {name: 'explanation', type: 'text', validation: required},
          ],
        },
        {
          name: 'lessonFaq',
          title: 'FAQ',
          type: 'object',
          fields: [
            title,
            {
              name: 'items',
              type: 'array',
              validation: (rule: Rule) => rule.required().min(1),
              of: [
                {
                  type: 'object',
                  name: 'faqItem',
                  fields: [
                    {name: 'question', type: 'string', validation: required},
                    rich('answer', 'Answer'),
                  ],
                },
              ],
            },
          ],
        },
        {
          name: 'lessonCitations',
          title: 'Citations',
          type: 'object',
          fields: [
            title,
            {
              name: 'sources',
              type: 'array',
              validation: (rule: Rule) => rule.required().min(1),
              of: [
                {
                  type: 'object',
                  name: 'source',
                  fields: [
                    {name: 'title', type: 'string', validation: required},
                    {name: 'publisher', type: 'string'},
                    {name: 'year', type: 'string'},
                    {
                      name: 'url',
                      type: 'url',
                      validation: (rule: Rule) => rule.required().uri({scheme: ['http', 'https']}),
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    }),
  ]
}
