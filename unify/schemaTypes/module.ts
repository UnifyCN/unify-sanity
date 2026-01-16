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
          { title: 'School', value: 'school' },
          { title: 'Book', value: 'book' },
          { title: 'Work', value: 'work' },
          { title: 'Computer', value: 'computer' },
          { title: 'Business', value: 'business' },
          { title: 'Science', value: 'science' },
          { title: 'Language', value: 'language' },
          { title: 'History', value: 'history' },
          { title: 'Psychology', value: 'psychology' },
          { title: 'Menu Book', value: 'menu_book' },
          { title: 'Auto Stories', value: 'auto_stories' },
          { title: 'Calculate', value: 'calculate' },
          { title: 'Palette', value: 'palette' },
          { title: 'Music Note', value: 'music_note' },
          { title: 'Sports Esports', value: 'sports_esports' },
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
