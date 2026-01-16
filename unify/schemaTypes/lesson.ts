import { defineField, defineType } from 'sanity'

// Block configuration with separate text alignment
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
  name: 'lesson',
  title: 'Lesson',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Lesson Title',
      type: 'string',
      description: 'The name of this lesson. This will be displayed in navigation and lesson lists.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'A URL-friendly version of the title. Auto-generated from the title, but can be customized. Used in URLs.',
      options: { source: 'title', maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      description: 'A brief summary of what this lesson covers. Helps users understand the lesson content before starting.',
    }),
    defineField({
      name: 'submodule',
      title: 'Submodule',
      type: 'reference',
      to: [{type: 'submodule'}],
      description: 'Select the parent submodule (section) that this lesson belongs to. You can search for it here.',
      validation: (rule) => rule.required(),
    }),

    // each lesson have mutliple pages
    defineField({
      name: 'pages',
      title: 'Lesson Pages',
      type: 'array',
      description: 'The main content pages of this lesson. These pages contain the educational content and are shown before activity pages.',
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
              description: 'The main content of this lesson page. You can add text, images, example boxes, notes, tips, and dropdown sections.',
              of: [
                blockWithAlignment,
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
                      validation: (rule) => rule.required() 
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
                      validation: (rule) => rule.required() 
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
                      validation: (rule) => rule.required() 
                    },
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
      description: 'Interactive activity pages with questions, input fields, and exercises. These pages appear after the lesson pages and allow users to practice what they learned.',
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
              description: 'The title of this activity page. Displayed at the top of the activity.',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'order',
              title: 'Page Order',
              type: 'number',
              description: 'The order in which this activity page appears. Lower numbers appear first. Start from 0.',
              validation: (rule) => rule.required().min(0),
            }),
            defineField({
              name: 'instructions',
              title: 'Instructions',
              type: 'array',
              description: 'The instructions and interactive elements for this activity. You can add text, input fields, and various question types.',
              of: [
                blockWithAlignment,
                {
                  type: 'object',
                  name: 'large_input_box',
                  title: 'Large Input Box',
                  icon: () => '📝',
                  description: 'A large text input field for longer responses or essays.',
                  fields: [
                    { 
                      name: 'label', 
                      type: 'string', 
                      title: 'Field Label',
                      description: 'The label displayed above the input field.',
                    },
                    { 
                      name: 'placeholder', 
                      type: 'string', 
                      title: 'Placeholder Text',
                      description: 'Hint text shown inside the input field when it is empty.',
                    },
                    { 
                      name: 'required', 
                      type: 'boolean', 
                      title: 'Required',
                      description: 'Whether this field must be filled before submission.',
                      initialValue: false 
                    },
                  ],
                },
                {
                  type: 'object',
                  name: 'mid_input_box',
                  title: 'Medium Input Box',
                  icon: () => '📄',
                  description: 'A medium-sized text input field for moderate-length responses.',
                  fields: [
                    { 
                      name: 'label', 
                      type: 'string', 
                      title: 'Field Label',
                      description: 'The label displayed above the input field.',
                    },
                    { 
                      name: 'placeholder', 
                      type: 'string', 
                      title: 'Placeholder Text',
                      description: 'Hint text shown inside the input field when it is empty.',
                    },
                    { 
                      name: 'required', 
                      type: 'boolean', 
                      title: 'Required',
                      description: 'Whether this field must be filled before submission.',
                      initialValue: false 
                    },
                  ],
                },
                {
                  type: 'object',
                  name: 'small_input_box',
                  title: 'Small Input Box',
                  icon: () => '📋',
                  description: 'A small text input field for short responses or single-word answers.',
                  fields: [
                    { 
                      name: 'label', 
                      type: 'string', 
                      title: 'Field Label',
                      description: 'The label displayed above the input field.',
                    },
                    { 
                      name: 'placeholder', 
                      type: 'string', 
                      title: 'Placeholder Text',
                      description: 'Hint text shown inside the input field when it is empty.',
                    },
                    { 
                      name: 'required', 
                      type: 'boolean', 
                      title: 'Required',
                      description: 'Whether this field must be filled before submission.',
                      initialValue: false 
                    },
                  ],
                },
                {
                  type: 'object',
                  name: 'multiple_choice_single',
                  title: 'Multiple Choice (Single Answer)',
                  icon: () => '☑️',
                  description: 'A multiple choice question where users can select only one correct answer.',
                  fields: [
                    {
                      name: 'question_text',
                      title: 'Question Text',
                      type: 'array',
                      of: [blockWithAlignment],
                      description: 'The question text that users will see.',
                      validation: (rule) => rule.required(),
                    },
                    {
                      name: 'options',
                      title: 'Answer Options',
                      type: 'array',
                      description: 'The answer choices for this question. Must have at least 2 options and exactly 1 correct answer.',
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
                              of: [blockWithAlignment],
                              description: 'The text displayed for this answer option.',
                              validation: (rule) => rule.required(),
                            },
                            {
                              name: 'value',
                              title: 'Option Value',
                              type: 'string',
                              description: 'A unique identifier for this option (e.g., "option_a", "option_1").',
                              validation: (rule) => rule.required(),
                            },
                            {
                              name: 'is_correct',
                              title: '✓ Correct Answer',
                              type: 'boolean',
                              description: 'Mark this option as the correct answer. For single choice questions, exactly one option must be marked correct.',
                              initialValue: false,
                            },
                            {
                              name: 'explanation',
                              title: 'Explanation',
                              type: 'array',
                              of: [blockWithAlignment],
                              description: 'Optional explanation shown to users when they select this option (or after submission).',
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
                  description: 'A multiple choice question where users can select multiple correct answers.',
                  fields: [
                    {
                      name: 'question_text',
                      title: 'Question Text',
                      type: 'array',
                      of: [blockWithAlignment],
                      description: 'The question text that users will see.',
                      validation: (rule) => rule.required(),
                    },
                    {
                      name: 'options',
                      title: 'Answer Options',
                      type: 'array',
                      description: 'The answer choices for this question. Must have at least 2 options and at least 1 correct answer.',
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
                              of: [blockWithAlignment],
                              description: 'The text displayed for this answer option.',
                              validation: (rule) => rule.required(),
                            },
                            {
                              name: 'value',
                              title: 'Option Value',
                              type: 'string',
                              description: 'A unique identifier for this option (e.g., "option_a", "option_1").',
                              validation: (rule) => rule.required(),
                            },
                            {
                              name: 'is_correct',
                              title: '✓ Correct Answer',
                              type: 'boolean',
                              description: 'Mark this option as a correct answer. For multiple choice questions, at least one option must be marked correct.',
                              initialValue: false,
                            },
                            {
                              name: 'explanation',
                              title: 'Explanation',
                              type: 'array',
                              of: [blockWithAlignment],
                              description: 'Optional explanation shown to users when they select this option (or after submission).',
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
                  description: 'A true/false or yes/no style question with exactly two answer options.',
                  fields: [
                    {
                      name: 'question_text',
                      title: 'Question Text',
                      type: 'array',
                      of: [blockWithAlignment],
                      description: 'The question text that users will see.',
                      validation: (rule) => rule.required(),
                    },
                    {
                      name: 'options',
                      title: 'Answer Options (2 options only)',
                      type: 'array',
                      description: 'Exactly two answer options. One must be marked as correct.',
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
                              of: [blockWithAlignment],
                              description: 'The text displayed for this answer option.',
                              validation: (rule) => rule.required(),
                            },
                            {
                              name: 'value',
                              title: 'Option Value',
                              type: 'string',
                              description: 'A unique identifier for this option (e.g., "option_a", "option_1").',
                              validation: (rule) => rule.required(),
                            },
                            {
                              name: 'is_correct',
                              title: '✓ Correct Answer',
                              type: 'boolean',
                              description: 'Mark this option as the correct answer. For two options questions, exactly one option must be marked correct.',
                              initialValue: false,
                            },
                            {
                              name: 'explanation',
                              title: 'Explanation',
                              type: 'array',
                              of: [blockWithAlignment],
                              description: 'Optional explanation shown to users when they select this option (or after submission).',
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
                  description: 'A matching question where users match items from two columns (e.g., terms with definitions).',
                  fields: [
                    {
                      name: 'question_text',
                      title: 'Question Text',
                      type: 'array',
                      of: [blockWithAlignment],
                      description: 'The question text or instructions for the matching exercise.',
                      validation: (rule) => rule.required(),
                    },
                    {
                      name: 'matching_pairs',
                      title: 'Matching Pairs',
                      type: 'array',
                      description: 'The pairs of items that should be matched. Must have at least 2 pairs.',
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
                              description: 'The item that appears in the left column (e.g., a term or question).',
                              validation: (rule) => rule.required(),
                            },
                            {
                              name: 'right_item',
                              title: 'Right Item',
                              type: 'string',
                              description: 'The item that appears in the right column and matches the left item (e.g., a definition or answer).',
                              validation: (rule) => rule.required(),
                            },
                            {
                              name: 'explanation',
                              title: 'Explanation',
                              type: 'array',
                              of: [blockWithAlignment],
                              description: 'Optional explanation shown to users about this matching pair.',
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
              description: 'A feedback box that appears after users submit their answers. Use this to provide explanations, correct answers, or additional information.',
              fields: [
                defineField({
                  name: 'title',
                  title: 'Answer Box Title',
                  type: 'string',
                  description: 'The heading for the answer/feedback box.',
                }),
                defineField({
                  name: 'content',
                  title: 'Answer Box Content',
                  type: 'array',
                  of: [blockWithAlignment],
                  description: 'The feedback content shown to users. Can include text, explanations, and formatting.',
                  validation: (rule) => rule.required(),
                }),
                defineField({
                  name: 'showAfterSubmit',
                  title: 'Show After Submit',
                  type: 'boolean',
                  description: 'If enabled, the answer box appears only after the user submits their answers. If disabled, it is always visible.',
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
      description: 'The order in which this lesson appears within its parent submodule. Lower numbers appear first. Note: always start from 1 and increment by 1 for different lessons (you will have to track this yourself for every lesson in a submodule).',
      initialValue: 0,
    }),

    // Ending pages shown after quizzes/activities
    defineField({
      name: 'ending_pages',
      title: 'Ending Pages',
      type: 'array',
      description: 'Conclusion pages shown after all lesson and activity pages. Use these to summarize, provide next steps, or wrap up the lesson.',
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
              description: 'The heading for this ending page. Displayed at the top of the page.',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'order',
              title: 'Page Order',
              type: 'number',
              description: 'The order in which this ending page appears. Lower numbers appear first. Start from 0.',
              validation: (rule) => rule.required().min(0),
            }),
            defineField({
              name: 'content',
              title: 'Page Content',
              type: 'array',
              description: 'The main content of this ending page. You can add text, images, example boxes, notes, tips, and dropdown sections.',
              of: [
                blockWithAlignment,
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
                      validation: (rule) => rule.required() 
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
                      validation: (rule) => rule.required() 
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
                      validation: (rule) => rule.required() 
                    },
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
