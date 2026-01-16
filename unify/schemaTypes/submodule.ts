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
      description: 'Note: submodule terminology is only for the backend. In the frontend they are called sections.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      description: 'A brief summary of what this submodule covers. Helps users understand the content before starting.',
    }),
    defineField({
      name: 'module',
      title: 'Module',
      type: 'reference',
      to: [{type: 'module'}],
      description: 'Select the parent module that this submodule belongs to. Submodules are organized under modules. You can search for it here.',
      validation: (rule) => rule.required(),
    }),

    // Intro pages for submodule
    defineField({
      name: 'intro_pages',
      title: 'Intro Pages',
      type: 'array',
      description: 'Introduction pages shown before the lessons in this submodule. Use these to provide context, overview, or prerequisites. They will be the first ones the be shown in the section.',
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
              description: 'The heading for this intro page. Displayed at the top of the page.',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'order',
              title: 'Page Order',
              type: 'number',
              description: 'The order in which this page appears. Lower numbers appear first. Start from 0.',
              validation: (rule) => rule.required().min(0),
            }),
            defineField({
              name: 'content',
              title: 'Page Content',
              type: 'array',
              description: 'The main content of this intro page. You can add text, images, example boxes, notes, tips, and dropdown sections.',
              of: [
                { type: 'block' },
                {
                  type: 'image',
                  fields: [{ 
                    name: 'alt', 
                    type: 'string', 
                    title: 'Alt text',
                    description: 'Alternative text for the image. Important for accessibility and SEO.',
                  }],
                },
                {
                  type: 'object',
                  name: 'example_box',
                  title: 'Example Box',
                  icon: () => '💡',
                  description: 'A highlighted box to display examples or sample content.',
                  fields: [
                    { 
                      name: 'content', 
                      type: 'array', 
                      of: [{ type: 'block' }], 
                      title: 'Example Content',
                      description: 'The example content to display in the box.',
                      validation: (rule) => rule.required() 
                    },
                  ],
                },
                {
                  type: 'object',
                  name: 'note_box',
                  title: 'Note Box',
                  icon: () => '📝',
                  description: 'A highlighted box to display important notes or additional information.',
                  fields: [
                    { 
                      name: 'content', 
                      type: 'array', 
                      of: [{ type: 'block' }], 
                      title: 'Note Content',
                      description: 'The note content to display in the box.',
                      validation: (rule) => rule.required() 
                    },
                  ],
                },
                {
                  type: 'object',
                  name: 'tip_box',
                  title: 'Tip Box',
                  icon: () => '💡',
                  description: 'A highlighted box to display helpful tips or best practices.',
                  fields: [
                    { 
                      name: 'content', 
                      type: 'array', 
                      of: [{ type: 'block' }], 
                      title: 'Tip Content',
                      description: 'The tip content to display in the box.',
                      validation: (rule) => rule.required() 
                    },
                  ],
                },
                {
                  type: 'object',
                  name: 'dropdown',
                  title: 'Dropdown Section',
                  icon: () => 'DD',
                  description: 'A collapsible dropdown section that users can expand to see additional content.',
                  fields: [
                    { 
                      name: 'label', 
                      type: 'string', 
                      title: 'Label',
                      description: 'The text displayed on the dropdown button that users click to expand.',
                    },
                    { 
                      name: 'content', 
                      type: 'array', 
                      of: [{ type: 'block' }], 
                      title: 'Dropdown Content',
                      description: 'The content that appears when the dropdown is expanded.',
                    },
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
      description: 'The order in which this submodule appears within its parent module. Lower numbers appear first. Note: always start from 1 and increment by 1 for different submodules (you will have to track this yourself for every submodules in a module)',
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
