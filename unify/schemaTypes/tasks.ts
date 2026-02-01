import { defineField, defineType } from 'sanity'

// Same block configuration as lesson pages: alignment, link, headers, quote, etc.
const blockWithAlignment = {
  type: 'block',
  styles: [
    { title: 'Normal', value: 'normal' },
    { title: 'H1', value: 'h1' },
    { title: 'H2', value: 'h2' },
    { title: 'H3', value: 'h3' },
    { title: 'Quote', value: 'blockquote' },
  ],
  marks: {
    decorators: [
      { title: 'Strong', value: 'strong' },
      { title: 'Emphasis', value: 'em' },
      { title: 'Code', value: 'code' },
    ],
    annotations: [
      {
        title: 'URL',
        name: 'link',
        type: 'object',
        fields: [
          {
            title: 'URL',
            name: 'href',
            type: 'url',
          },
        ],
      },
      {
        title: 'Text Alignment',
        name: 'textAlign',
        type: 'object',
        fields: [
          {
            title: 'Alignment',
            name: 'align',
            type: 'string',
            options: {
              list: [
                { title: 'Left', value: 'left' },
                { title: 'Center', value: 'center' },
                { title: 'Right', value: 'right' },
              ],
            },
            initialValue: 'left',
          },
        ],
      },
    ],
  },
}

export default defineType({
  name: 'task',
  title: 'Task',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'The title of this task. Displayed in navigation and at the top of the page.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'submodule',
      title: 'Submodule',
      type: 'reference',
      to: [{ type: 'submodule' }],
      description: 'Select the submodule (section) this task belongs to.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'ordering',
      title: 'Order',
      type: 'number',
      description: 'The order in which this task appears within its submodule. Lower numbers appear first. Start from 0.',
      validation: (rule) => rule.required().min(0),
    }),
    defineField({
      name: 'content',
      title: 'Content',
      type: 'array',
      description: 'The main content of this task. Same as lesson pages: text, images, example boxes, notes, tips, and dropdown sections.',
      of: [
        blockWithAlignment,
        {
          type: 'image',
          fields: [
            {
              name: 'alt',
              type: 'string',
              title: 'Alt text',
              description: 'Alternative text for the image. Important for accessibility and SEO.',
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
              of: [blockWithAlignment],
              title: 'Dropdown Content',
              description: 'The content that appears when the dropdown is expanded.',
            },
          ],
        },
        {
          type: 'object',
          name: 'example_box',
          title: 'Example Box',
          icon: () => 'Ex',
          description: 'A highlighted box to display examples or sample content.',
          fields: [
            {
              name: 'content',
              type: 'array',
              of: [blockWithAlignment],
              title: 'Example Content',
              description: 'The example content to display in the box.',
              validation: (rule) => rule.required(),
            },
          ],
        },
        {
          type: 'object',
          name: 'tip_box',
          title: 'Tip Box',
          icon: () => 'T',
          description: 'A highlighted box to display helpful tips or best practices.',
          fields: [
            {
              name: 'content',
              type: 'array',
              of: [blockWithAlignment],
              title: 'Tip Content',
              description: 'The tip content to display in the box.',
              validation: (rule) => rule.required(),
            },
          ],
        },
        {
          type: 'object',
          name: 'note_box',
          title: 'Note Box',
          icon: () => 'N',
          description: 'A highlighted box to display important notes or additional information.',
          fields: [
            {
              name: 'content',
              type: 'array',
              of: [blockWithAlignment],
              title: 'Note Content',
              description: 'The note content to display in the box.',
              validation: (rule) => rule.required(),
            },
          ],
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'submodule.title',
    },
    prepare(selection) {
      return {
        title: selection.title || 'Untitled Task',
        subtitle: `Submodule: ${selection.subtitle || '—'}`,
      }
    },
  },
})
