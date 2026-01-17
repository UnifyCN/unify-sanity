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
      description: 'Select the lesson that this quiz belongs to. You can search for it here.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Quiz Title',
      type: 'string',
      description: 'The name of this quiz. This will be displayed to users when they take the quiz.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      description: 'A brief description of what this quiz covers. Helps users understand what they will be tested on.',
    }),

    // a lesson can have multiple quizzes
    defineField({
      name: 'order_number',
      title: 'Order Number',
      type: 'number',
      description: 'The order in which this quiz appears within its parent lesson. Lower numbers appear first. Start from 0.',
      validation: (rule) => rule.required().min(0),
    }),

    // questions can just be editted here too
    defineField({
      name: 'questions',
      title: 'Quiz Questions',
      type: 'array',
      description: 'The questions for this quiz. You can add multiple question types including multiple choice, true/false, fill in the blank, short answer, matching, and long answer.',
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
              description: 'Select the type of question. Different question types have different answer formats and requirements.',
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
              description: 'The question text that users will see. You can format it with headings, bold, italic, and links.',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'options',
              title: 'Answer Options',
              type: 'array',
              description: 'The answer choices for multiple choice and true/false questions. Must have at least 2 options. For single choice questions, exactly 1 option must be marked correct. For multiple choice questions, at least 1 option must be marked correct.',
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
                      description: 'The text displayed for this answer option. You can format it with headings, bold, italic, and links.',
                      validation: (rule) => rule.required(),
                    },
                    {
                      name: 'value',
                      title: 'Option Value',
                      type: 'string',
                      description: 'A unique identifier for this option (e.g., "option_a", "true", "false"). Used internally to identify the selected answer.',
                      validation: (rule) => rule.required(),
                    },
                    {
                      name: 'is_correct',
                      title: '✓ Correct Answer',
                      type: 'boolean',
                      initialValue: false,
                      description: 'Check this box if this option is a correct answer. For single choice questions, exactly one option must be marked correct. For multiple choice questions, at least one option must be marked correct.',
                    },
                    {
                      name: 'explanation',
                      title: 'Explanation (if selected)',
                      type: 'array',
                      of: [blockWithAlignment],
                      description: 'Optional explanation shown to users when they select this option (or after submission). Use this to provide feedback on why this option is correct or incorrect.',
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
              description: 'The pairs of items that should be matched. Must have at least 2 pairs. Users will match items from the left column with items from the right column.',
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
                      description: 'The item that appears in the left column (e.g., a term, concept, or question).',
                      validation: (rule) => rule.required(),
                    },
                    {
                      name: 'right_item',
                      title: 'Right Item',
                      type: 'string',
                      description: 'The item that appears in the right column and matches the left item (e.g., a definition, answer, or description).',
                      validation: (rule) => rule.required(),
                    },
                    {
                      name: 'explanation',
                      title: 'Explanation',
                      type: 'array',
                      of: [blockWithAlignment],
                      description: 'Optional explanation shown to users about this matching pair. Use this to provide feedback on why these items match.',
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
              description: 'The correct answer for fill in the blank, short answer, and long answer questions. This field is not used for multiple choice, true/false, or matching questions (those use options or matching_pairs instead).',
              fields: [
                {
                  name: 'value',
                  title: 'Answer Value(s)',
                  type: 'array',
                  of: [{ type: 'string' }],
                  description: 'The correct answer(s) for this question. For single answers, enter one value. For questions with multiple possible correct answers, enter multiple values (e.g., ["answer1", "answer2"]).',
                },
                {
                  name: 'explanation',
                  title: 'General Explanation',
                  type: 'array',
                  of: [blockWithAlignment],
                  description: 'Overall explanation for the correct answer(s). Shown to users after they submit their answer. You can format it with headings, bold, italic, and links.',
                },
                {
                  name: 'points',
                  title: 'Points for Correct Answer',
                  type: 'number',
                  description: 'The number of points awarded for answering this question correctly. Default is 1 point.',
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
              description: 'The order in which this question appears in the quiz. Lower numbers appear first. Start from 0.',
              validation: (rule) => rule.required().min(0),
            }),
            defineField({
              name: 'answer_box',
              title: 'Answer Box (Feedback)',
              type: 'object',
              description: 'A feedback box that appears after users submit their answer. Use this to provide explanations, additional information, or general feedback about the question.',
              fields: [
                defineField({
                  name: 'content',
                  title: 'Answer Box Content',
                  type: 'array',
                  of: [blockWithAlignment],
                  description: 'The feedback content shown to users. Can include text, explanations, and formatting. You can format it with headings, bold, italic, and links.',
                  validation: (rule) => rule.required(),
                }),
                defineField({
                  name: 'showAfterSubmit',
                  title: 'Show After Submit',
                  type: 'boolean',
                  description: 'If enabled, the answer box appears only after the user submits their answer. If disabled, it is always visible.',
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
