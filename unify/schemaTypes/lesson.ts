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
                {
                  type: 'object',
                  name: 'multiple_choice_single',
                  title: 'Multiple Choice (Single Answer)',
                  icon: () => '☑️',
                  fields: [
                    {
                      name: 'question_text',
                      title: 'Question Text',
                      type: 'array',
                      of: [{ type: 'block' }],
                      validation: (rule) => rule.required(),
                    },
                    {
                      name: 'options',
                      title: 'Answer Options',
                      type: 'array',
                      of: [
                        {
                          type: 'object',
                          name: 'option',
                          title: 'Option',
                          fields: [
                            {
                              name: 'text',
                              title: 'Option Text',
                              type: 'array',
                              of: [{ type: 'block' }],
                              validation: (rule) => rule.required(),
                            },
                            {
                              name: 'value',
                              title: 'Option Value',
                              type: 'string',
                              validation: (rule) => rule.required(),
                            },
                            {
                              name: 'is_correct',
                              title: '✓ Correct Answer',
                              type: 'boolean',
                              initialValue: false,
                            },
                            {
                              name: 'explanation',
                              title: 'Explanation',
                              type: 'array',
                              of: [{ type: 'block' }],
                            },
                          ],
                        },
                      ],
                      validation: (rule) => rule.required().min(2).custom((options: any) => {
                        const correctOptions = options?.filter((opt: any) => opt.is_correct) || [];
                        if (correctOptions.length !== 1) {
                          return 'Single choice questions must have exactly 1 correct answer';
                        }
                        return true;
                      }),
                    },
                  ],
                },
                {
                  type: 'object',
                  name: 'multiple_choice_multiple',
                  title: 'Multiple Choice (Multiple Answers)',
                  icon: () => '☑️☑️',
                  fields: [
                    {
                      name: 'question_text',
                      title: 'Question Text',
                      type: 'array',
                      of: [{ type: 'block' }],
                      validation: (rule) => rule.required(),
                    },
                    {
                      name: 'options',
                      title: 'Answer Options',
                      type: 'array',
                      of: [
                        {
                          type: 'object',
                          name: 'option',
                          title: 'Option',
                          fields: [
                            {
                              name: 'text',
                              title: 'Option Text',
                              type: 'array',
                              of: [{ type: 'block' }],
                              validation: (rule) => rule.required(),
                            },
                            {
                              name: 'value',
                              title: 'Option Value',
                              type: 'string',
                              validation: (rule) => rule.required(),
                            },
                            {
                              name: 'is_correct',
                              title: '✓ Correct Answer',
                              type: 'boolean',
                              initialValue: false,
                            },
                            {
                              name: 'explanation',
                              title: 'Explanation',
                              type: 'array',
                              of: [{ type: 'block' }],
                            },
                          ],
                        },
                      ],
                      validation: (rule) => rule.required().min(2).custom((options: any) => {
                        const correctOptions = options?.filter((opt: any) => opt.is_correct) || [];
                        if (correctOptions.length < 1) {
                          return 'Multiple choice questions must have at least 1 correct answer';
                        }
                        return true;
                      }),
                    },
                  ],
                },
                {
                  type: 'object',
                  name: 'two_options_question',
                  title: 'Two Options Question',
                  icon: () => '⚖️',
                  fields: [
                    {
                      name: 'question_text',
                      title: 'Question Text',
                      type: 'array',
                      of: [{ type: 'block' }],
                      validation: (rule) => rule.required(),
                    },
                    {
                      name: 'options',
                      title: 'Answer Options (2 options only)',
                      type: 'array',
                      of: [
                        {
                          type: 'object',
                          name: 'option',
                          title: 'Option',
                          fields: [
                            {
                              name: 'text',
                              title: 'Option Text',
                              type: 'array',
                              of: [{ type: 'block' }],
                              validation: (rule) => rule.required(),
                            },
                            {
                              name: 'value',
                              title: 'Option Value',
                              type: 'string',
                              validation: (rule) => rule.required(),
                            },
                            {
                              name: 'is_correct',
                              title: '✓ Correct Answer',
                              type: 'boolean',
                              initialValue: false,
                            },
                            {
                              name: 'explanation',
                              title: 'Explanation',
                              type: 'array',
                              of: [{ type: 'block' }],
                            },
                          ],
                        },
                      ],
                      validation: (rule) => rule.required().length(2).custom((options: any) => {
                        const correctOptions = options?.filter((opt: any) => opt.is_correct) || [];
                        if (correctOptions.length !== 1) {
                          return 'Two options questions must have exactly 1 correct answer';
                        }
                        return true;
                      }),
                    },
                  ],
                },
                {
                  type: 'object',
                  name: 'matching_question',
                  title: 'Matching Question',
                  icon: () => '🔗',
                  fields: [
                    {
                      name: 'question_text',
                      title: 'Question Text',
                      type: 'array',
                      of: [{ type: 'block' }],
                      validation: (rule) => rule.required(),
                    },
                    {
                      name: 'matching_pairs',
                      title: 'Matching Pairs',
                      type: 'array',
                      of: [
                        {
                          type: 'object',
                          name: 'matching_pair',
                          title: 'Matching Pair',
                          fields: [
                            {
                              name: 'left_item',
                              title: 'Left Item',
                              type: 'string',
                              validation: (rule) => rule.required(),
                            },
                            {
                              name: 'right_item',
                              title: 'Right Item',
                              type: 'string',
                              validation: (rule) => rule.required(),
                            },
                            {
                              name: 'explanation',
                              title: 'Explanation',
                              type: 'array',
                              of: [{ type: 'block' }],
                            },
                          ],
                        },
                      ],
                      validation: (rule) => rule.required().min(2),
                    },
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
