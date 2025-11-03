import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'lesson',
  title: 'Lesson',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Lesson Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
    }),
    defineField({
      name: 'submodule',
      title: 'Submodule',
      type: 'reference',
      to: [{type: 'submodule'}],
      validation: (rule) => rule.required(),
    }),

    // each lesson have mutliple pages
    defineField({
      name: 'pages',
      title: 'Lesson Pages',
      type: 'array',
      of: [
        defineField({
          name: 'page',
          title: 'Lesson Page',
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              title: 'Page Title',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'order',
              title: 'Page Order',
              type: 'number',
              validation: (rule) => rule.required().min(0),
            }),
            defineField({
              name: 'content',
              title: 'Page Content',
              type: 'array',
              of: [
                { type: 'block' },
                {
                  type: 'image',
                  fields: [{ name: 'alt', type: 'string', title: 'Alt text' }],
                },
                {
                  type: 'object',
                  name: 'dropdown',
                  title: 'Dropdown Section',
                  icon: () => 'DD',
                  fields: [
                    { name: 'label', type: 'string', title: 'Label' },
                    { name: 'content', type: 'array', of: [{ type: 'block' }], title: 'Dropdown Content' },
                  ],
                },
                {
                  type: 'object',
                  name: 'example_box',
                  title: 'Example Box',
                  icon: () => 'Ex',
                  fields: [
                    { name: 'content', type: 'array', of: [{ type: 'block' }], title: 'Example Content', validation: (rule) => rule.required() },
                  ],
                },
                {
                  type: 'object',
                  name: 'tip_box',
                  title: 'Tip Box',
                  icon: () => 'T',
                  fields: [
                    { name: 'content', type: 'array', of: [{ type: 'block' }], title: 'Tip Content', validation: (rule) => rule.required() },
                  ],
                },
                {
                  type: 'object',
                  name: 'note_box',
                  title: 'Note Box',
                  icon: () => 'N',
                  fields: [
                    { name: 'content', type: 'array', of: [{ type: 'block' }], title: 'Note Content', validation: (rule) => rule.required() },
                  ],
                },
              ],
            }),
          ],
        }),
      ],
    }),

    // Activity pages for interactive content
    defineField({
      name: 'activity_pages',
      title: 'Activity Pages',
      type: 'array',
      of: [
        defineField({
          name: 'activityPage',
          title: 'Activity Page',
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              title: 'Activity Title',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'order',
              title: 'Page Order',
              type: 'number',
              validation: (rule) => rule.required().min(0),
            }),
            defineField({
              name: 'instructions',
              title: 'Instructions',
              type: 'array',
              of: [
                { type: 'block' },
                {
                  type: 'object',
                  name: 'large_input_box',
                  title: 'Large Input Box',
                  icon: () => '📝',
                  fields: [
                    { name: 'label', type: 'string', title: 'Field Label' },
                    { name: 'placeholder', type: 'string', title: 'Placeholder Text' },
                    { name: 'required', type: 'boolean', title: 'Required', initialValue: false },
                  ],
                },
                {
                  type: 'object',
                  name: 'mid_input_box',
                  title: 'Medium Input Box',
                  icon: () => '📄',
                  fields: [
                    { name: 'label', type: 'string', title: 'Field Label' },
                    { name: 'placeholder', type: 'string', title: 'Placeholder Text' },
                    { name: 'required', type: 'boolean', title: 'Required', initialValue: false },
                  ],
                },
                {
                  type: 'object',
                  name: 'small_input_box',
                  title: 'Small Input Box',
                  icon: () => '📋',
                  fields: [
                    { name: 'label', type: 'string', title: 'Field Label' },
                    { name: 'placeholder', type: 'string', title: 'Placeholder Text' },
                    { name: 'required', type: 'boolean', title: 'Required', initialValue: false },
                  ],
                },
              ],
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'answer_box',
              title: 'Answer Box (Feedback)',
              type: 'object',
              fields: [
                defineField({
                  name: 'title',
                  title: 'Answer Box Title',
                  type: 'string',
                }),
                defineField({
                  name: 'content',
                  title: 'Answer Box Content',
                  type: 'array',
                  of: [{ type: 'block' }],
                  validation: (rule) => rule.required(),
                }),
                defineField({
                  name: 'showAfterSubmit',
                  title: 'Show After Submit',
                  type: 'boolean',
                  initialValue: true,
                }),
              ],
            }),
          ],
        }),
      ],
    }),

    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      initialValue: 0,
    }),

    // Ending pages shown after quizzes/activities
    defineField({
      name: 'ending_pages',
      title: 'Ending Pages',
      type: 'array',
      of: [
        defineField({
          name: 'endingPage',
          title: 'Ending Page',
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              title: 'Page Title',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'order',
              title: 'Page Order',
              type: 'number',
              validation: (rule) => rule.required().min(0),
            }),
            defineField({
              name: 'content',
              title: 'Page Content',
              type: 'array',
              of: [
                { type: 'block' },
                {
                  type: 'image',
                  fields: [{ name: 'alt', type: 'string', title: 'Alt text' }],
                },
                {
                  type: 'object',
                  name: 'dropdown',
                  title: 'Dropdown Section',
                  icon: () => 'DD',
                  fields: [
                    { name: 'label', type: 'string', title: 'Label' },
                    { name: 'content', type: 'array', of: [{ type: 'block' }], title: 'Dropdown Content' },
                  ],
                },
                {
                  type: 'object',
                  name: 'example_box',
                  title: 'Example Box',
                  icon: () => 'Ex',
                  fields: [
                    { name: 'content', type: 'array', of: [{ type: 'block' }], title: 'Example Content', validation: (rule) => rule.required() },
                  ],
                },
                {
                  type: 'object',
                  name: 'tip_box',
                  title: 'Tip Box',
                  icon: () => 'T',
                  fields: [
                    { name: 'content', type: 'array', of: [{ type: 'block' }], title: 'Tip Content', validation: (rule) => rule.required() },
                  ],
                },
                {
                  type: 'object',
                  name: 'note_box',
                  title: 'Note Box',
                  icon: () => 'N',
                  fields: [
                    { name: 'content', type: 'array', of: [{ type: 'block' }], title: 'Note Content', validation: (rule) => rule.required() },
                  ],
                },
              ],
            }),
          ],
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'order',
    },
  },
})
