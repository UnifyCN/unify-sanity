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
  { title: 'Not arrived yet', value: 'not_arrived' },
  { title: 'Arrived 0–3 months', value: 'arrived_0_3_months' },
  { title: '3–12 months', value: 'months_3_12' },
  { title: '1–3 years', value: 'years_1_3' },
  { title: '3+ years', value: 'years_3_plus' },
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
      name: 'personas',
      title: 'Personas',
      type: 'array',
      of: [{ type: 'string' }],
      description:
        'User profiles this item applies to. Must match persona values stored in Supabase.',
      options: {
        list: PERSONA_OPTIONS,
        layout: 'grid',
      },
      validation: rule => rule.required().min(1),
    }),

    defineField({
      name: 'stage',
      title: 'Stage (time in Canada)',
      type: 'string',
      description:
        "Must match app's stageNumberToStageSlug(): not_arrived, arrived_0_3_months, months_3_12, years_1_3, years_3_plus.",
      options: {
        list: STAGE_OPTIONS,
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
      description: 'Brief description (e.g., the "Why" line).',
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
        'Order of this item within its class (lower numbers appear first; use 0, 1, 2, ...).',
      validation: rule => rule.required().integer().min(0),
    }),

    defineField({
      name: 'module',
      title: 'Link to Module (optional)',
      type: 'reference',
      to: [{ type: 'module' }],
      description: 'Link this item to a module. Use either Module or Submodule, not both.',
      hidden: ({ parent }) => !!parent?.submodule,
      validation: rule =>
        rule.custom((moduleRef, context) => {
          const submoduleRef = (context.parent as { submodule?: { _ref?: string } })?.submodule
          if (moduleRef && submoduleRef) return 'Choose either Module or Submodule, not both.'
          return true
        }),
    }),

    defineField({
      name: 'submodule',
      title: 'Link to Submodule (optional)',
      type: 'reference',
      to: [{ type: 'submodule' }],
      description: 'Link this item to a submodule. Use either Module or Submodule, not both.',
      hidden: ({ parent }) => !!parent?.module,
      validation: rule =>
        rule.custom((submoduleRef, context) => {
          const moduleRef = (context.parent as { module?: { _ref?: string } })?.module
          if (moduleRef && submoduleRef) return 'Choose either Module or Submodule, not both.'
          return true
        }),
    }),
  ],

  preview: {
    select: {
      title: 'title',
      stage: 'stage',
      class: 'class',
      personas: 'personas',
    },
    prepare(selection) {
      const stageLabel =
        STAGE_OPTIONS.find(o => o.value === selection.stage)?.title ?? selection.stage
      const classLabel =
        CHECKLIST_CLASS_OPTIONS.find(o => o.value === selection.class)?.title ?? selection.class

      const personas = Array.isArray(selection.personas) ? selection.personas : []
      const personaLabel = personas.length ? personas.join(', ') : 'No persona'

      return {
        title: selection.title || 'Untitled checklist item',
        subtitle: `${personaLabel} · ${stageLabel} · ${classLabel}`,
      }
    },
  },
})
