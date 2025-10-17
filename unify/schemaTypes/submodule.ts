import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'submodule',
  title: 'Submodule',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
    }),
    defineField({
      name: 'module',
      title: 'Module',
      type: 'reference',
      to: [{type: 'module'}],
      validation: (rule) => rule.required(),
    }),

    // Intro pages for submodule
    defineField({
      name: 'intro_pages',
      title: 'Intro Pages',
      type: 'array',
      of: [
        defineField({
          name: 'intro_page',
          title: 'Intro Page',
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
              ],
              validation: (rule) => rule.required(),
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
      subtitle: 'description',
    },
  },
})
