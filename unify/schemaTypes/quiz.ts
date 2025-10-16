import { defineField, defineType } from 'sanity'

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
      name: 'orderNumber',
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
          name: 'quizQuestion',
          title: 'Question',
          type: 'object',
          fields: [
            defineField({
              name: 'questionType',
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
              name: 'questionText',
              title: 'Question Text',
              type: 'text',
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
                      type: 'string',
                      validation: (rule) => rule.required(),
                    },
                    {
                      name: 'value',
                      title: 'Option Value',
                      type: 'string',
                      validation: (rule) => rule.required(),
                    },
                    {
                      name: 'isCorrect',
                      title: 'Is Correct Answer',
                      type: 'boolean',
                      initialValue: false,
                    },
                    {
                      name: 'explanation',
                      title: 'Explanation (if selected)',
                      type: 'text',
                    },
                  ],
                },
              ],
              hidden: ({ parent }) => !['multiple_choice_single', 'multiple_choice_multiple', 'true_false'].includes(parent?.questionType),
              validation: (rule) => rule.custom((options, context) => {
                const questionType = context.parent?.questionType;
                
                if (['multiple_choice_single', 'multiple_choice_multiple', 'true_false'].includes(questionType)) {
                  if (!options || options.length < 2) {
                    return 'At least 2 options are required';
                  }
                  
                  const correctOptions = options.filter(opt => opt.isCorrect);
                  
                  if (questionType === 'multiple_choice_single' && correctOptions.length !== 1) {
                    return 'Single choice questions must have exactly 1 correct answer';
                  }
                  
                  if (questionType === 'multiple_choice_multiple' && correctOptions.length < 1) {
                    return 'Multiple choice questions must have at least 1 correct answer';
                  }
                  
                  if (questionType === 'true_false' && correctOptions.length !== 1) {
                    return 'True/False questions must have exactly 1 correct answer';
                  }
                }
                
                return true;
              }),
            }),
            defineField({
              name: 'correctAnswer',
              title: 'Correct Answer',
              type: 'object',
              fields: [
                {
                  name: 'value',
                  title: 'Answer Value',
                  type: 'string',
                },
                {
                  name: 'explanation',
                  title: 'Explanation',
                  type: 'text',
                },
              ],
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'orderNum',
              title: 'Order Number',
              type: 'number',
              validation: (rule) => rule.required().min(0),
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
