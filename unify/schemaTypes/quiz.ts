import {defineType} from 'sanity'

export default defineType({
  name: 'quiz',
  title: 'Quiz',
  type: 'document',
  fields: [
    {
      name: 'submodule',
      title: 'Submodule',
      type: 'reference',
      to: [{type: 'submodule'}],
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'questions',
      title: 'Questions',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{type: 'quizQuestion'}],
        },
      ],
    },
  ],
  preview: {
    select: {
      title: 'submodule.title',
      subtitle: 'questions',
    },
    prepare(selection) {
      const {title, subtitle} = selection
      return {
        title: `Quiz for ${title}`,
        subtitle: `${subtitle?.length || 0} questions`,
      }
    },
  },
})
