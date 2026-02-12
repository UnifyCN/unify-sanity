import { defineField, defineType } from 'sanity'

// Personas: must match Supabase / frontend persona slugs exactly (6 options)
export const CHECKLIST_PERSONA_OPTIONS = [
  { title: 'International Student', value: 'international_student' },
  { title: 'Refugee', value: 'refugee' },
  { title: 'Protected Person', value: 'protected_person' },
  { title: 'Skilled Worker', value: 'skilled_worker' },
  { title: 'Immigrant', value: 'immigrant' },
  { title: 'PR', value: 'pr' },
]

// Stage = time in Canada / lifecycle; must match frontend stage slugs
export const CHECKLIST_STAGE_OPTIONS = [
  { title: 'Stage 0: Not arrived yet', value: 'not_arrived' },
  { title: 'Stage 1: Arrived (0–3 months)', value: 'arrived_0_3_months' },
  { title: 'Stage 2: 3–12 months', value: 'months_3_12' },
  { title: 'Stage 3: 1–3 years', value: 'years_1_3' },
  { title: 'Stage 4: 3+ years', value: 'years_3_plus' },
]

const CHECKLIST_CLASS_OPTIONS = [
  { title: 'Do now', value: 'do_now' },
  { title: 'Do soon', value: 'do_soon' },
  { title: 'Explore and connect', value: 'explore_and_connect' },
  { title: 'Optional / later', value: 'optional_later' },
]

// Tab link: user can link item to a tab instead of module/submodule (choose 1 of 3)
export const CHECKLIST_LINK_TAB_OPTIONS = [
  { title: 'Home', value: 'home' },
  { title: 'Community', value: 'community' },
  { title: 'Companion', value: 'companion' },
  { title: 'Checklist', value: 'checklist' },
  { title: 'Learn', value: 'learn' },
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
      description:
        'User profiles this item applies to. Select one or more. If you select both International Student and Skilled Worker and PR, users with either persona will see this item. Must match persona values stored in Supabase.',
      of: [{ type: 'string' }],
      options: {
        list: CHECKLIST_PERSONA_OPTIONS,
        layout: 'grid',
      },
      validation: (rule) => rule.required().min(1).error('Select at least one persona.'),
    }),

    defineField({
      name: 'stage',
      title: 'Stage (time in Canada)',
      type: 'string',
      description:
        'Lifecycle stage: Not arrived yet, Arrived 0–3 months, 3–12 months, 1–3 years, or 3+ years. User’s stage must match to see this item.',
      options: {
        list: CHECKLIST_STAGE_OPTIONS,
      },
      validation: rule => rule.required(),
    }),

    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Short title for this checklist item.',
      validation: rule => rule.required(),
    }),

    defineField({
      name: 'description',
      title: 'Short description',
      type: 'text',
      description: 'Brief description (e.g. the "Why" line).',
    }),
    defineField({
      name: 'longer_description',
      title: 'Longer description',
      type: 'text',
      description: 'Optional longer description with more detail for this checklist item.',
    }),

    defineField({
      name: 'class',
      title: 'Class',
      type: 'string',
      description: 'Category: Do now, Do soon, Explore and connect, or Optional / later.',
      options: {
        list: CHECKLIST_CLASS_OPTIONS,
      },
      validation: rule => rule.required(),
    }),

    defineField({
      name: 'class_order',
      title: 'Order within class',
      type: 'number',
      description:
        'Order of this item within its class (e.g. within "Do now"). Lower numbers appear first; use 0, 1, 2, …',
      initialValue: 0,
      validation: (rule) => rule.required().integer().min(0),
    }),
    defineField({
      name: 'module',
      title: 'Link to Module',
      type: 'reference',
      to: [{ type: 'module' }],
      description: 'Choose one: link to a Module, a Submodule, or a Tab. Only one can be set.',
      hidden: ({ parent }) => !!(parent?.submodule || parent?.link_tab),
      validation: rule =>
        rule.custom((moduleRef, context) => {
          const p = context.parent as { submodule?: { _ref?: string }; link_tab?: string }
          if (moduleRef && (p?.submodule || p?.link_tab))
            return 'Choose only one: Module, Submodule, or Tab.'
          if (!moduleRef && !p?.submodule && !p?.link_tab)
            return 'Choose either a Module, Submodule, or Tab (one required).'
          return true
        }),
    }),

    defineField({
      name: 'submodule',
      title: 'Link to Submodule',
      type: 'reference',
      to: [{ type: 'submodule' }],
      description: 'Choose one: link to a Module, a Submodule, or a Tab. Only one can be set.',
      hidden: ({ parent }) => !!(parent?.module || parent?.link_tab),
      validation: rule =>
        rule.custom((submoduleRef, context) => {
          const p = context.parent as { module?: { _ref?: string }; link_tab?: string }
          if (submoduleRef && (p?.module || p?.link_tab))
            return 'Choose only one: Module, Submodule, or Tab.'
          if (!submoduleRef && !p?.module && !p?.link_tab)
            return 'Choose either a Module, Submodule, or Tab (one required).'
          return true
        }),
    }),

    defineField({
      name: 'link_tab',
      title: 'Link to Tab',
      type: 'string',
      description: 'Choose one: link to a Module, a Submodule, or a Tab. Only one can be set.',
      options: {
        list: CHECKLIST_LINK_TAB_OPTIONS,
      },
      hidden: ({ parent }) => !!(parent?.module || parent?.submodule),
      validation: rule =>
        rule.custom((linkTab, context) => {
          const p = context.parent as { module?: { _ref?: string }; submodule?: { _ref?: string } }
          if (linkTab && (p?.module || p?.submodule))
            return 'Choose only one: Module, Submodule, or Tab.'
          if (!linkTab && !p?.module && !p?.submodule)
            return 'Choose either a Module, Submodule, or Tab (one required).'
          return true
        }),
    }),
  ],

  preview: {
    select: {
      title: 'title',
      personas: 'personas',
      stage: 'stage',
      class: 'class',
    },
    prepare(selection) {
      const personaLabels = (selection.personas || [])
        .map((v: string) => CHECKLIST_PERSONA_OPTIONS.find((o) => o.value === v)?.title ?? v)
        .join(', ')
      const stageLabel =
        CHECKLIST_STAGE_OPTIONS.find((o) => o.value === selection.stage)?.title ?? selection.stage
      const classLabel =
        CHECKLIST_CLASS_OPTIONS.find(o => o.value === selection.class)?.title ?? selection.class

      const personas = Array.isArray(selection.personas) ? selection.personas : []
      const personaLabel = personas.length ? personas.join(', ') : 'No persona'

      return {
        title: selection.title || 'Untitled checklist item',
        subtitle: [personaLabels, stageLabel, classLabel].filter(Boolean).join(' · '),
      }
    },
  },
})
