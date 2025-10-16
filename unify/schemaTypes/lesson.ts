import {defineType} from 'sanity'

export default defineType({
  name: 'lesson',
  title: 'Lesson',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
    },
    {
      name: 'orderNumber',
      title: 'Order Number',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'submodule',
      title: 'Submodule',
      type: 'reference',
      to: [{type: 'submodule'}],
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'pages',
      title: 'Pages',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'lessonPage',
          title: 'Lesson Page',
          fields: [
            {
              name: 'title',
              title: 'Page Title',
              type: 'string',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'orderNumber',
              title: 'Order Number',
              type: 'number',
              validation: (Rule) => Rule.required().min(0),
            },
            {
              name: 'contents',
              title: 'Page Contents',
              type: 'array',
              of: [
                {
                  type: 'object',
                  name: 'pageContent',
                  title: 'Content Block',
                  fields: [
                    {
                      name: 'contentType',
                      title: 'Content Type',
                      type: 'string',
                      options: {
                        list: [
                          {title: 'Text', value: 'text'},
                          {title: 'Bullet Points', value: 'bullet_points'},
                          {title: 'Image', value: 'image'},
                          {title: 'Dropdown', value: 'dropdown'},
                          {title: 'Input', value: 'input'},
                        ],
                      },
                      validation: (Rule) => Rule.required(),
                    },
                    {
                      name: 'orderNumber',
                      title: 'Order Number',
                      type: 'number',
                      validation: (Rule) => Rule.required().min(0),
                    },
                    {
                      name: 'content',
                      title: 'Content',
                      type: 'object',
                      fields: [
                        {
                          name: 'text',
                          title: 'Text Content',
                          type: 'text',
                        },
                        {
                          name: 'richText',
                          title: 'Rich Text',
                          type: 'array',
                          of: [{type: 'block'}],
                        },
                        {
                          name: 'bulletPoints',
                          title: 'Bullet Points',
                          type: 'array',
                          of: [{type: 'string'}],
                        },
                        {
                          name: 'image',
                          title: 'Image',
                          type: 'image',
                        },
                        {
                          name: 'dropdownOptions',
                          title: 'Dropdown Options',
                          type: 'array',
                          of: [
                            {
                              type: 'object',
                              fields: [
                                {
                                  name: 'label',
                                  title: 'Label',
                                  type: 'string',
                                },
                                {
                                  name: 'value',
                                  title: 'Value',
                                  type: 'string',
                                },
                              ],
                            },
                          ],
                        },
                        {
                          name: 'inputConfig',
                          title: 'Input Configuration',
                          type: 'object',
                          fields: [
                            {
                              name: 'placeholder',
                              title: 'Placeholder',
                              type: 'string',
                            },
                            {
                              name: 'type',
                              title: 'Input Type',
                              type: 'string',
                              options: {
                                list: [
                                  {title: 'Text', value: 'text'},
                                  {title: 'Number', value: 'number'},
                                  {title: 'Email', value: 'email'},
                                ],
                              },
                            },
                          ],
                        },
                        {
                          name: 'structuredData',
                          title: 'Structured Data',
                          type: 'text',
                          description: 'JSON string for custom structured data',
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'orderNumber',
    },
  },
})
