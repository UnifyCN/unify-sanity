import { defineField, defineType } from 'sanity'

const PERSONA_OPTIONS = [
  { title: 'International Student', value: 'international_student' },
  { title: 'Refugee', value: 'refugee' },
  { title: 'Protected Person', value: 'protected_person' },
  { title: 'Skilled Worker', value: 'skilled_worker' },
  { title: 'Immigrant', value: 'immigrant' },
  { title: 'PR', value: 'pr' },
]

// ✅ Importante: soporta AMBOS formatos (por si dateHelpers usa slugs o números)
const STAGE_OPTIONS = [
  // numeric (0-4)
  { title: 'Stage 0: Not arrived yet (0)', value: '0' },
  { title: 'Stage 1: 0–3 months (1)', value: '1' },
  { title: 'Stage 2: 3–12 months (2)', value: '2' },
  { title: 'Stage 3: 1–3 years (3)', value: '3' },
  { title: 'Stage 4: 3+ years (4)', value: '4' },

  // slug-style (muy común en apps)
  { title: 'Stage 0: Not arrived yet (not_arrived_yet)', value: 'not_arrived_yet' },
  { title: 'Stage 1: 0–3 months (arrived_0_3_months)', value: 'arrived_0_3_months' },
  { title: 'Stage 2: 3–12 months (3_12_months)', value: '3_12_months' },
  { title: 'Stage 3: 1–3 years (1_3_years)', value: '1_3_years' },
  { title: 'Stage 4: 3+ years (3_plus_years)', value: '3_plus_years' },
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
    // ✅ personas: array de strings, cada string con lista válida
    defineField({
      name: 'personas',
      title: 'Personas',
      type: 'array',
      of: [
        {
          type: 'string',
          options: { list: PERSONA_OPTIONS },
        },
      ],
      description:
        'Select one or more personas. Must match persona values stored in Supabase.',
      validation: (rule) => rule.required().min(1),
    }),

    // ✅ stage: soporta 0-4 o slugs
    defineField({
      name: 'stage',
      title: 'Stage (time in Canada)',
      type: 'string',
      options: { list: STAGE_OPTIONS },
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: 'description',
      title: 'Short description',
      type: 'text',
    }),

    defineField({
      name: 'class',
      title: 'Class',
      type: 'string',
      options: { list: CHECKLIST_CLASS_OPTIONS },
      validation: (rule) => rule.required(),
    }),

    // ✅ evita undefined (a veces rompe orden o UI)
    defineField({
      name: 'class_order',
      title: 'Order within class',
      type: 'number',
      description: '0, 1, 2... Lower appears first.',
      initialValue: 0,
      validation: (rule) => rule.required().integer().min(0),
    }),

    // (Deja module/submodule si ya los usas; si no, puedes quitarlos PERO no hace falta para arreglar el fetch)
    defineField({
      name: 'module',
      title: 'Link to Module',
      type: 'reference',
      to: [{ type: 'module' }],
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
    select: { title: 'title', personas: 'personas', class: 'class', stage: 'stage' },
    prepare(selection) {
      const classLabel =
        CHECKLIST_CLASS_OPTIONS.find((o) => o.value === selection.class)?.title ?? selection.class

      const firstPersona =
        Array.isArray(selection.personas) && selection.personas.length > 0
          ? selection.personas[0]
          : null

      const personaLabel =
        PERSONA_OPTIONS.find((o) => o.value === firstPersona)?.title ?? firstPersona ?? '—'

      return {
        title: selection.title || 'Untitled checklist item',
        subtitle: `${personaLabel} · ${classLabel} · stage=${selection.stage ?? '—'}`,
      }
    },
  },
})
