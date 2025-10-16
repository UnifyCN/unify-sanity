import {defineType} from 'sanity'

export default defineType({
  name: 'quizQuestion',
  title: 'Quiz Question',
  type: 'document',
  fields: [
    {
      name: 'questionType',
      title: 'Question Type',
      type: 'string',
      options: {
        list: [
          {title: 'Multiple Choice', value: 'multiple_choice'},
          {title: 'True/False', value: 'true_false'},
          {title: 'Fill in the Blank', value: 'fill_blank'},
          {title: 'Short Answer', value: 'short_answer'},
        ],
      },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'questionText',
      title: 'Question Text',
      type: 'text',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'options',
      title: 'Options',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'text',
              title: 'Option Text',
              type: 'string',
            },
            {
              name: 'value',
              title: 'Option Value',
              type: 'string',
            },
          ],
        },
      ],
    },
    {
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
    },
    {
      name: 'quiz',
      title: 'Quiz',
      type: 'reference',
      to: [{type: 'quiz'}],
      validation: (Rule) => Rule.required(),
    },
  ],
  preview: {
    select: {
      title: 'questionText',
      subtitle: 'questionType',
    },
  },
})
