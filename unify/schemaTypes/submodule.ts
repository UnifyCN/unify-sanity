import {defineType} from 'sanity'

export default defineType({
  name: 'submodule',
  title: 'Submodule',
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
      name: 'module',
      title: 'Module',
      type: 'reference',
      to: [{type: 'module'}],
      validation: (Rule) => Rule.required(),
    },
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'description',
    },
  },
})
