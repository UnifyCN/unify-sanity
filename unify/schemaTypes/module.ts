import {defineType} from 'sanity'
import {IconSelector} from '../components/IconSelector'
import {provinceField} from './fields/province'

export default defineType({
  name: 'module',
  title: 'Course',
  type: 'document',
  fields: [
    // Managed by @sanity/document-internationalization (hidden from editors).
    {
      name: 'language',
      type: 'string',
      readOnly: true,
      hidden: true,
    },
    provinceField,
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'The name of the course. This will be displayed prominently throughout the application.',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
      description: 'A brief overview or summary of what this course covers. This helps users understand the course content before starting.',
    },
    {
      name: 'colorTheme',
      title: 'Color Theme',
      type: 'color',
      description: 'Choose a color theme for this course. This color will be used for visual branding and theming throughout the course interface.',
      options: {
        disableAlpha: true,
      },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'icon',
      title: 'Course Icon',
      type: 'string',
      description: 'Select an icon to represent this course. Icons are from Material UI Icons library and will be displayed in course cards and navigation. (Note: if you wanted to use an icon that is not in this list, contact Paul to add them in)',
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
