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
  name: 'quiz',
  title: 'Quiz',
  type: 'document',
  fields: [
    defineField({
      name: 'lesson',
      title: 'Lesson',
      type: 'reference',
      to: [{type: 'lesson'}],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Quiz Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
    }),

    // a lesson can have multiple quizzes
    defineField({
      name: 'order_number',
      title: 'Order Number',
      type: 'number',
      validation: (rule) => rule.required().min(0),
    }),

    // questions can just be editted here too
    defineField({
      name: 'questions',
      title: 'Quiz Questions',
      type: 'array',
      of: [
        defineField({
          name: 'quiz_question',
          title: 'Question',
          type: 'object',
          fields: [
            defineField({
              name: 'question_type',
              title: 'Question Type',
              type: 'string',
              options: {
                list: [
                  { title: 'Multiple Choice Single Answer', value: 'multiple_choice_single' },
                  { title: 'Multiple Choice Multiple Answer', value: 'multiple_choice_multiple' },
                  { title: 'True/False', value: 'true_false' },
                  { title: 'Fill in the Blank', value: 'fill_blank' },
                  { title: 'Short Answer', value: 'short_answer' },
                  { title: 'Matching', value: 'matching' },
                  { title: 'Long Answer', value: 'long_answer' }
                ]
              },
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'question_text',
              title: 'Question Text',
              type: 'array',
              of: [blockWithAlignment],
              validation: (rule) => rule.required(),
            }),
            defineField({
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
                      of: [blockWithAlignment],
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
                      description: 'Check this box if this option is a correct answer',
                    },
                    {
                      name: 'explanation',
                      title: 'Explanation (if selected)',
                      type: 'array',
                      of: [blockWithAlignment],
                      description: 'Explanation shown when this option is selected',
                    },
                  ],
                },
              ],
              hidden: ({ parent }) => !['multiple_choice_single', 'multiple_choice_multiple', 'true_false'].includes(parent?.question_type),
              validation: (rule) => rule.custom((options, context) => {
                const questionType = (context.parent as any)?.question_type;
                
                if (['multiple_choice_single', 'multiple_choice_multiple', 'true_false'].includes(questionType)) {
                  if (!options || options.length < 2) {
                    return 'At least 2 options are required';
                  }
                  
                  const correctOptions = options.filter((opt: any) => opt.is_correct);
                  
                  if (questionType === 'multiple_choice_single' && correctOptions.length !== 1) {
                    return 'Single choice questions must have exactly 1 correct answer. Currently: ' + correctOptions.length + ' correct answers.';
                  }
                  
                  if (questionType === 'multiple_choice_multiple' && correctOptions.length < 1) {
                    return 'Multiple choice questions must have at least 1 correct answer. Currently: ' + correctOptions.length + ' correct answers.';
                  }
                  
                  if (questionType === 'true_false' && correctOptions.length !== 1) {
                    return 'True/False questions must have exactly 1 correct answer. Currently: ' + correctOptions.length + ' correct answers.';
                  }
                }
                
                return true;
              }),
            }),
            defineField({
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
                      of: [blockWithAlignment],
                    },
                  ],
                },
              ],
              hidden: ({ parent }) => parent?.question_type !== 'matching',
              validation: (rule) => rule.custom((pairs, context) => {
                const questionType = (context.parent as any)?.question_type;
                
                if (questionType === 'matching') {
                  if (!pairs || pairs.length < 2) {
                    return 'Matching questions must have at least 2 pairs';
                  }
                }
                
                return true;
              }),
            }),
            defineField({
              name: 'correct_answer',
              title: 'Correct Answer',
              type: 'object',
              fields: [
                {
                  name: 'value',
                  title: 'Answer Value(s)',
                  type: 'array',
                  of: [{ type: 'string' }],
                  description: 'For single choice: one value. For multiple choice: multiple values.',
                },
                {
                  name: 'explanation',
                  title: 'General Explanation',
                  type: 'array',
                  of: [blockWithAlignment],
                  description: 'Overall explanation for the correct answer(s)',
                },
                {
                  name: 'points',
                  title: 'Points for Correct Answer',
                  type: 'number',
                  initialValue: 1,
                  validation: (rule) => rule.required().min(0),
                },
              ],
              hidden: ({ parent }) => ['multiple_choice_single', 'multiple_choice_multiple', 'true_false', 'matching'].includes(parent?.question_type),
              validation: (rule) => rule.custom((correctAnswer, context) => {
                const questionType = (context.parent as any)?.question_type;
                
                if (!['multiple_choice_single', 'multiple_choice_multiple', 'true_false', 'matching'].includes(questionType)) {
                  if (!correctAnswer?.value || (correctAnswer.value as any[]).length === 0) {
                    return 'Correct answer is required for this question type';
                  }
                }
                
                return true;
              }),
            }),
            defineField({
              name: 'order_number',
              title: 'Order Number',
              type: 'number',
              validation: (rule) => rule.required().min(0),
            }),
            defineField({
              name: 'answer_box',
              title: 'Answer Box (Feedback)',
              type: 'object',
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
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'lesson.title',
    },
    prepare(selection) {
      return {
        title: selection.title || 'Untitled Quiz',
        subtitle: `Lesson: ${selection.subtitle}`,
      }
    },
  },
})
