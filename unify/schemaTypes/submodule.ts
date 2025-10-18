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
                {
                  type: 'object',
                  name: 'example_box',
                  title: 'Example Box',
                  icon: () => '💡',
                  fields: [
                    { name: 'content', type: 'array', of: [{ type: 'block' }], title: 'Example Content', validation: (rule) => rule.required() },
                  ],
                },
                {
                  type: 'object',
                  name: 'note_box',
                  title: 'Note Box',
                  icon: () => '📝',
                  fields: [
                    { name: 'content', type: 'array', of: [{ type: 'block' }], title: 'Note Content', validation: (rule) => rule.required() },
                  ],
                },
                {
                  type: 'object',
                  name: 'tip_box',
                  title: 'Tip Box',
                  icon: () => '💡',
                  fields: [
                    { name: 'content', type: 'array', of: [{ type: 'block' }], title: 'Tip Content', validation: (rule) => rule.required() },
                  ],
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
