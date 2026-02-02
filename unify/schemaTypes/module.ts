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
      description: 'The name of the module. This will be displayed prominently throughout the application.',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
      description: 'A brief overview or summary of what this module covers. This helps users understand the module content before starting.',
    },
    {
      name: 'colorTheme',
      title: 'Color Theme',
      type: 'color',
      description: 'Choose a color theme for this module. This color will be used for visual branding and theming throughout the module interface.',
      options: {
        disableAlpha: true,
      },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'icon',
      title: 'Module Icon',
      type: 'string',
      description: 'Select an icon to represent this module. Icons are from Material UI Icons library and will be displayed in module cards and navigation. (Note: if you wanted to use an icon that is not in this list, contact Paul to add them in)',
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
