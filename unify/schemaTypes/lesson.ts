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
                    { name: 'content', type: 'text', title: 'Dropdown Content' },
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

    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      initialValue: 0,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'order',
    },
  },
})
