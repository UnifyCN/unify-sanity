import { defineField, defineType } from 'sanity'

// Block configuration with separate text alignment (same as quiz/lesson)
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

// Reusable option object for multiple choice / true-false (used in both quiz questions and activity blocks)
const optionObject = {
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
      validation: (rule: any) => rule.required(),
    },
    {
      name: 'value',
      title: 'Option Value',
      type: 'string',
      description: 'A unique identifier for this option (e.g., "option_a", "true", "false").',
      validation: (rule: any) => rule.required(),
    },
    {
      name: 'is_correct',
      title: '✓ Correct Answer',
      type: 'boolean',
      initialValue: false,
      description: 'Mark this option as the correct answer.',
    },
    {
      name: 'explanation',
      title: 'Explanation',
      type: 'array',
      of: [blockWithAlignment],
      description: 'Optional explanation shown to users when they select this option (or after submission).',
    },
  ],
}

// Quiz-style single question (one per page when practice_type is "quiz")
const quizQuestionObject = {
  type: 'object',
  name: 'quiz_question',
  title: 'Question',
  fields: [
    defineField({
      name: 'question_type',
      title: 'Question Type',
      type: 'string',
      description: 'Select the type of question.',
      options: {
        list: [
          { title: 'Multiple Choice Single Answer', value: 'multiple_choice_single' },
          { title: 'Multiple Choice Multiple Answer', value: 'multiple_choice_multiple' },
          { title: 'True/False', value: 'true_false' },
          { title: 'Fill in the Blank', value: 'fill_blank' },
          { title: 'Short Answer', value: 'short_answer' },
          { title: 'Matching', value: 'matching' },
          { title: 'Long Answer', value: 'long_answer' },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'question_text',
      title: 'Question Text',
      type: 'array',
      of: [blockWithAlignment],
      description: 'The question text that users will see.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'options',
      title: 'Answer Options',
      type: 'array',
      description: 'Required for multiple choice and true/false. At least 2 options; for single choice exactly 1 correct, for multiple at least 1 correct.',
      of: [optionObject],
      hidden: ({ parent }) => !['multiple_choice_single', 'multiple_choice_multiple', 'true_false'].includes(parent?.question_type),
      validation: (rule) =>
        rule.custom((options, context) => {
          const questionType = (context.parent as any)?.question_type
          if (!['multiple_choice_single', 'multiple_choice_multiple', 'true_false'].includes(questionType)) return true
          if (!options || options.length < 2) return 'At least 2 options are required'
          const correctOptions = options.filter((opt: any) => opt.is_correct)
          if (questionType === 'multiple_choice_single' && correctOptions.length !== 1)
            return 'Single choice must have exactly 1 correct answer.'
          if (questionType === 'multiple_choice_multiple' && correctOptions.length < 1)
            return 'Multiple choice must have at least 1 correct answer.'
          if (questionType === 'true_false' && correctOptions.length !== 1)
            return 'True/False must have exactly 1 correct answer.'
          return true
        }),
    }),
    defineField({
      name: 'matching_pairs',
      title: 'Matching Pairs',
      type: 'array',
      description: 'At least 2 pairs. Users match left column with right column.',
      of: [
        {
          type: 'object',
          name: 'matching_pair',
          title: 'Matching Pair',
          fields: [
            { name: 'left_item', title: 'Left Item', type: 'string', validation: (rule: any) => rule.required() },
            { name: 'right_item', title: 'Right Item', type: 'string', validation: (rule: any) => rule.required() },
            { name: 'explanation', title: 'Explanation', type: 'array', of: [blockWithAlignment] },
          ],
        },
      ],
      hidden: ({ parent }) => parent?.question_type !== 'matching',
      validation: (rule) =>
        rule.custom((pairs, context) => {
          if ((context.parent as any)?.question_type !== 'matching') return true
          return !pairs || pairs.length < 2 ? 'Matching questions must have at least 2 pairs' : true
        }),
    }),
    defineField({
      name: 'correct_answer',
      title: 'Correct Answer',
      type: 'object',
      description: 'For fill in the blank, short answer, and long answer.',
      fields: [
        {
          name: 'value',
          title: 'Answer Value(s)',
          type: 'array',
          of: [{ type: 'string' }],
          description: 'One or more accepted correct answers.',
        },
        {
          name: 'explanation',
          title: 'General Explanation',
          type: 'array',
          of: [blockWithAlignment],
        },
        {
          name: 'points',
          title: 'Points for Correct Answer',
          type: 'number',
          initialValue: 1,
          validation: (rule) => rule.required().min(0),
        },
      ],
      hidden: ({ parent }) =>
        ['multiple_choice_single', 'multiple_choice_multiple', 'true_false', 'matching'].includes(parent?.question_type),
      validation: (rule) =>
        rule.custom((correctAnswer, context) => {
          const questionType = (context.parent as any)?.question_type
          if (['multiple_choice_single', 'multiple_choice_multiple', 'true_false', 'matching'].includes(questionType))
            return true
          if (!correctAnswer?.value || (correctAnswer.value as any[]).length === 0)
            return 'Correct answer is required for this question type'
          return true
        }),
    }),
    defineField({
      name: 'order_number',
      title: 'Order Number',
      type: 'number',
      description: 'Order in which this question appears. Lower numbers first. Start from 0.',
      validation: (rule) => rule.required().min(0),
    }),
    defineField({
      name: 'answer_box',
      title: 'Answer Box (Feedback)',
      type: 'object',
      description: 'Feedback shown after the user submits their answer.',
      fields: [
        defineField({
          name: 'content',
          title: 'Answer Box Content',
          type: 'array',
          of: [blockWithAlignment],
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
}

// Activity-style page (many items per page when practice_type is "activity")
const activityInstructionsOf = [
  blockWithAlignment,
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
        of: [blockWithAlignment],
        validation: (rule: any) => rule.required(),
      },
      {
        name: 'options',
        title: 'Answer Options',
        type: 'array',
        of: [optionObject],
        validation: (rule: any) =>
          rule.required().min(2).custom((options: any[]) => {
            const correct = options?.filter((o: any) => o.is_correct) || []
            return correct.length === 1 ? true : 'Single choice must have exactly 1 correct answer'
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
        of: [blockWithAlignment],
        validation: (rule: any) => rule.required(),
      },
      {
        name: 'options',
        title: 'Answer Options',
        type: 'array',
        of: [optionObject],
        validation: (rule: any) =>
          rule.required().min(2).custom((options: any[]) => {
            const correct = options?.filter((o: any) => o.is_correct) || []
            return correct.length >= 1 ? true : 'Multiple choice must have at least 1 correct answer'
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
        of: [blockWithAlignment],
        validation: (rule: any) => rule.required(),
      },
      {
        name: 'options',
        title: 'Answer Options (2 only)',
        type: 'array',
        of: [optionObject],
        validation: (rule: any) =>
          rule.required().length(2).custom((options: any[]) => {
            const correct = options?.filter((o: any) => o.is_correct) || []
            return correct.length === 1 ? true : 'Two options must have exactly 1 correct answer'
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
        of: [blockWithAlignment],
        validation: (rule: any) => rule.required(),
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
              { name: 'left_item', title: 'Left Item', type: 'string', validation: (rule: any) => rule.required() },
              { name: 'right_item', title: 'Right Item', type: 'string', validation: (rule: any) => rule.required() },
              { name: 'explanation', title: 'Explanation', type: 'array', of: [blockWithAlignment] },
            ],
          },
        ],
        validation: (rule: any) => rule.required().min(2),
      },
    ],
  },
]

export default defineType({
  name: 'practice',
  title: 'Practice',
  type: 'document',
  fields: [
    defineField({
      name: 'submodule',
      title: 'Submodule',
      type: 'reference',
      to: [{ type: 'submodule' }],
      description: 'Select the submodule (section) this practice belongs to.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Name of this practice. Shown to users when they open it.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      description: 'Brief description of what this practice covers.',
    }),
    defineField({
      name: 'practice_type',
      title: 'Practice Type',
      type: 'string',
      description:
        'Quiz: one question per page (like a quiz). Activity: many questions/items per page (like an activity).',
      options: {
        list: [
          { title: 'Quiz (one question per page)', value: 'quiz' },
          { title: 'Activity (many questions per page)', value: 'activity' },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'order_number',
      title: 'Order Number',
      type: 'number',
      description: 'Order within the submodule. Lower numbers appear first. Start from 0.',
      validation: (rule) => rule.required().min(0),
    }),

    // Used when practice_type === 'quiz'
    defineField({
      name: 'questions',
      title: 'Quiz Questions',
      type: 'array',
      description: 'One question per page. Add question types: multiple choice, true/false, fill in the blank, short answer, matching, long answer.',
      of: [quizQuestionObject],
      hidden: ({ parent }) => parent?.practice_type !== 'quiz',
    }),

    // Used when practice_type === 'activity'
    defineField({
      name: 'pages',
      title: 'Activity Pages',
      type: 'array',
      description: 'Each page can have many items: text, input boxes, and questions. Shown in order.',
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
              description: 'Add text, input fields, and question types. Same UI as lesson activity pages.',
              of: activityInstructionsOf,
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'answer_box',
              title: 'Answer Box (Feedback)',
              type: 'object',
              fields: [
                defineField({ name: 'title', title: 'Answer Box Title', type: 'string' }),
                defineField({
                  name: 'content',
                  title: 'Answer Box Content',
                  type: 'array',
                  of: [blockWithAlignment],
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
      hidden: ({ parent }) => parent?.practice_type !== 'activity',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'submodule.title',
      practice_type: 'practice_type',
    },
    prepare(selection) {
      const typeLabel = selection.practice_type === 'quiz' ? 'Quiz' : 'Activity'
      return {
        title: selection.title || 'Untitled Practice',
        subtitle: `${typeLabel} · ${selection.subtitle || 'No submodule'}`,
      }
    },
  },
})
