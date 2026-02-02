import { defineField, defineType } from 'sanity'

// Persona and time-in-Canada options — update from product doc when available
const PERSONA_OPTIONS = [
  { title: 'International Student', value: 'international_student' },
  { title: 'Newcomer', value: 'newcomer' },
  { title: 'Temporary Worker', value: 'temporary_worker' },
  { title: 'Permanent Resident', value: 'permanent_resident' },
  { title: 'Refugee', value: 'refugee' },
  { title: 'Other', value: 'other' },
]

const TIME_IN_CANADA_OPTIONS = [
  { title: 'Less than 1 year', value: 'less_than_1_year' },
  { title: '1–3 years', value: '1_to_3_years' },
  { title: '3+ years', value: '3_plus_years' },
  { title: 'Not yet in Canada', value: 'not_yet' },
]

const CHECKLIST_CLASS_OPTIONS = [
  { title: 'Do now', value: 'do_now' },
  { title: 'Do soon', value: 'do_soon' },
  { title: 'Explore and connect', value: 'explore_and_connect' },
  { title: 'Optional / later', value: 'optional_later' },
]

export default defineType({
  name: 'checklist',
  title: 'Checklist Item',
  type: 'document',
  fields: [
    defineField({
      name: 'persona',
      title: 'Persona',
      type: 'string',
      description: 'User profile this checklist item applies to. Update options from product doc if needed.',
      options: {
        list: PERSONA_OPTIONS,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'time_in_canada',
      title: 'Time in Canada',
      type: 'string',
      description: 'How long the user has been in Canada. Update options from product doc if needed.',
      options: {
        list: TIME_IN_CANADA_OPTIONS,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Short title for this checklist item.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Short description',
      type: 'text',
      description: 'Brief description of this checklist item.',
    }),
    defineField({
      name: 'class',
      title: 'Class',
      type: 'string',
      description: 'Category: Do now, Do soon, Explore and connect, or Optional / later.',
      options: {
        list: CHECKLIST_CLASS_OPTIONS,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'module',
      title: 'Link to Module',
      type: 'reference',
      to: [{ type: 'module' }],
      description: 'Link this item to a module. Use either Module or Submodule, not both.',
      hidden: ({ parent }) => !!parent?.submodule,
      validation: (rule) =>
        rule.custom((moduleRef, context) => {
          const submoduleRef = (context.parent as { submodule?: { _ref?: string } })?.submodule
          if (moduleRef && submoduleRef) return 'Choose either Module or Submodule, not both.'
          if (!moduleRef && !submoduleRef) return 'Choose either Module or Submodule (at least one required).'
          return true
        }),
    }),
    defineField({
      name: 'submodule',
      title: 'Link to Submodule',
      type: 'reference',
      to: [{ type: 'submodule' }],
      description: 'Link this item to a submodule (section). Use either Module or Submodule, not both.',
      hidden: ({ parent }) => !!parent?.module,
      validation: (rule) =>
        rule.custom((submoduleRef, context) => {
          const moduleRef = (context.parent as { module?: { _ref?: string } })?.module
          if (moduleRef && submoduleRef) return 'Choose either Module or Submodule, not both.'
          if (!moduleRef && !submoduleRef) return 'Choose either Module or Submodule (at least one required).'
          return true
        }),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      persona: 'persona',
      class: 'class',
    },
    prepare(selection) {
      const personaLabel =
        PERSONA_OPTIONS.find((o) => o.value === selection.persona)?.title ?? selection.persona
      const classLabel =
        CHECKLIST_CLASS_OPTIONS.find((o) => o.value === selection.class)?.title ?? selection.class
      return {
        title: selection.title || 'Untitled checklist item',
        subtitle: `${personaLabel} · ${classLabel}`,
      }
    },
  },
})
