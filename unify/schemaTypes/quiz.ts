import {defineType} from 'sanity'

export default defineType({
  name: 'quiz',
  title: 'Quiz',
  type: 'document',
  fields: [
    {
      name: 'lesson',
      title: 'Lesson',
      type: 'reference',
      to: [{type: 'lesson'}],
      validation: (Rule) => Rule.required(),
    },
  ],
  preview: {
    select: {
      title: 'lesson.title',
    },
    prepare(selection) {
      return {
        title: `Quiz for ${selection.title}`,
      }
    },
  },
})
