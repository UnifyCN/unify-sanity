import {defineType} from 'sanity'
import {IconSelector} from '../components/IconSelector'

export default defineType({
  name: 'module',
  title: 'Module',
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
      name: 'coverPhoto',
      title: 'Cover Photo',
      type: 'image',
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
          description: 'Important for SEO and accessibility',
        },
      ],
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'colorTheme',
      title: 'Color Theme',
      type: 'color',
      description: 'Pick a color theme for this module',
      options: {
        disableAlpha: true,
      },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'icon',
      title: 'Module Icon',
      type: 'string',
      description: 'Select an icon from Material UI Icons (@mui/icons-material)',
      components: {
        input: IconSelector,
      },
      options: {
        list: [
          { title: 'Account Balance', value: 'account_balance' },
          { title: 'Assignment Ind', value: 'assignment_ind' },
          { title: 'Cottage', value: 'cottage' },
          { title: 'Article', value: 'article' },
          { title: 'Passport', value: 'passport' },
        ],
      },
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
