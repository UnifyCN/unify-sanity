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

const LINK_TAB_OPTIONS = [
  { title: 'Home', value: 'home' },
  { title: 'AI Companion', value: 'ai_companion' },
  { title: 'Community', value: 'community' },
  { title: 'Learn', value: 'learn' },
]

const COMMUNITY_TARGET_OPTIONS = [
  { title: 'Gather (default)', value: 'gather' },
  { title: 'Event', value: 'event' },
  { title: 'Circle', value: 'circle' },
]

export default defineType({
  name: 'checklist',
  title: 'Checklist Item',
  type: 'document',
  fields: [
    // -------------------------
    // previous fields (required by existing data + GROQ query)
    // These are the ones showing up as "Unknown fields found"
    // -------------------------
    defineField({
      name: 'personas',
      title: 'Personas',
      type: 'array',
      of: [{ type: 'string' }],
      options: { list: PERSONA_OPTIONS },
      description: 'LEGACY: array of personas. Existing docs use this.',
    }),
    defineField({
      name: 'stage',
      title: 'Stage',
      type: 'string',
      description: 'LEGACY: stage slug used for filtering (existing docs use this).',
    }),
    defineField({
      name: 'class_order',
      title: 'Order within class',
      type: 'number',
      description: 'LEGACY: order inside the class group (0, 1, 2...).',
      validation: (rule) => rule.integer().min(0),
    }),

    // -------------------------
    // Current fields you had before (keep them, but remove "required" for now)
    // because old docs probably don’t have these filled
    // -------------------------
    defineField({
      name: 'persona',
      title: 'Persona (new - optional)',
      type: 'string',
      description:
        'NEW (optional): single persona. We keep it but do NOT require it (existing docs use personas[]).',
      options: { list: PERSONA_OPTIONS },
    }),
    defineField({
      name: 'time_in_canada',
      title: 'Time in Canada (new - optional)',
      type: 'string',
      description:
        'NEW (optional): time in Canada. Not required so existing docs don’t break.',
      options: { list: TIME_IN_CANADA_OPTIONS },
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
      options: { list: CHECKLIST_CLASS_OPTIONS },
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

    // -------------------------
    // new routing
    // -------------------------
    defineField({
      name: 'linkTab',
      title: 'Link to tab (optional)',
      type: 'string',
      options: { list: LINK_TAB_OPTIONS },
      description: 'If set, Learn How will route to this tab and optional target.',
    }),

    defineField({
      name: 'communityTarget',
      title: 'Community target (optional)',
      type: 'string',
      options: { list: COMMUNITY_TARGET_OPTIONS },
      description: 'Only used if Link to tab = Community.',
      hidden: ({ parent }) => parent?.linkTab !== 'community',
    }),

    defineField({
      name: 'linkEventId',
      title: 'Event ID (optional)',
      type: 'number',
      description: 'Used when Community target = Event.',
      hidden: ({ parent }) =>
        !(parent?.linkTab === 'community' && parent?.communityTarget === 'event'),
      validation: (rule) => rule.integer().positive(),
    }),

    defineField({
      name: 'linkPath',
      title: 'Explicit path (optional)',
      type: 'string',
      description: 'Used when Community target = Circle.',
      hidden: ({ parent }) =>
        !(parent?.linkTab === 'community' && parent?.communityTarget === 'circle'),
    }),
  ],

  preview: {
    select: {
      title: 'title',
      // Prefer legacy personas[] first (because that’s what your data has)
      personas: 'personas',
      persona: 'persona',
      class: 'class',
    },
    prepare(selection) {
      const classLabel =
        CHECKLIST_CLASS_OPTIONS.find((o) => o.value === selection.class)?.title ?? selection.class

      const personaValue =
        (Array.isArray(selection.personas) && selection.personas[0]) || selection.persona

      const personaLabel =
        PERSONA_OPTIONS.find((o) => o.value === personaValue)?.title ?? (personaValue ?? 'Unknown')

      return {
        title: selection.title || 'Untitled checklist item',
        subtitle: `${personaLabel} · ${classLabel}`,
      }
    },
  },
})
