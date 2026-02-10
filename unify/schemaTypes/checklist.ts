import { defineField, defineType } from 'sanity'

const PERSONA_OPTIONS = [
  { title: 'International Student', value: 'international_student' },
  { title: 'Refugee', value: 'refugee' },
  { title: 'Protected Person', value: 'protected_person' },
  { title: 'Skilled Worker', value: 'skilled_worker' },
  { title: 'Immigrant', value: 'immigrant' },
  { title: 'PR', value: 'pr' },
]

const STAGE_OPTIONS = [
  { title: 'Stage 0: Not arrived yet', value: '0' },
  { title: 'Stage 1: 0–3 months', value: '1' },
  { title: 'Stage 2: 3–12 months', value: '2' },
  { title: 'Stage 3: 1–3 years', value: '3' },
  { title: 'Stage 4: 3+ years', value: '4' },
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
    defineField({
      name: 'personas',
      title: 'Personas',
      type: 'array',
      of: [{ type: 'string' }],
      options: { list: PERSONA_OPTIONS },
      description:
        'User profiles this item applies to. Select one or more. Must match persona values stored in Supabase.',
      validation: (rule) => rule.required().min(1),
    }),

    defineField({
      name: 'stage',
      title: 'Stage (time in Canada)',
      type: 'string',
      options: { list: STAGE_OPTIONS },
      description:
        "Lifecycle stage: Not arrived yet, Arrived 0–3 months, 3–12 months, 1–3 years, or 3+ years. User's stage must match to see this item.",
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
      description: 'Brief description (e.g. the "Why" line).',
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
      name: 'class_order',
      title: 'Order within class',
      type: 'number',
      description:
        'Order of this item within its class (e.g. within "Do now"). Lower numbers appear first; use 0, 1, 2, ...',
      validation: (rule) => rule.required().integer().min(0),
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

    defineField({
      name: 'linkTab',
      title: 'Link to tab (optional)',
      type: 'string',
      options: { list: LINK_TAB_OPTIONS },
      description: 'If set, "Learn How" routes to this tab.',
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
      description: 'Used when Community target = Circle (or any custom route).',
      hidden: ({ parent }) =>
        !(parent?.linkTab === 'community' && parent?.communityTarget === 'circle'),
    }),
  ],

  preview: {
    select: {
      title: 'title',
      personas: 'personas',
      class: 'class',
    },
    prepare(selection) {
      const firstPersona = Array.isArray(selection.personas) ? selection.personas[0] : null
      const personaLabel =
        PERSONA_OPTIONS.find((o) => o.value === firstPersona)?.title ?? (firstPersona ?? 'Unknown')
      const classLabel =
        CHECKLIST_CLASS_OPTIONS.find((o) => o.value === selection.class)?.title ?? selection.class

      return {
        title: selection.title || 'Untitled checklist item',
        subtitle: `${personaLabel} · ${classLabel}`,
      }
    },
  },
})
