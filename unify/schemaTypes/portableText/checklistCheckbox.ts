/**
 * Portable Text object: tickable checklist row (pure UI — app renders checkbox + label).
 * Use in any rich-text `of` array alongside blocks (not in quiz question fields).
 */
export const checklistCheckboxBlock = {
  type: 'object',
  name: 'checklist_checkbox',
  title: 'Checklist item',
  icon: () => '☑',
  description: 'A single checkbox with label. Add several in a row for a checklist. Users can tick in the app (local UI state).',
  fields: [
    {
      name: 'label',
      title: 'Label',
      type: 'string',
      description: 'Text next to the checkbox.',
      validation: (rule: any) => rule.required(),
    },
    {
      name: 'defaultChecked',
      title: 'Start checked',
      type: 'boolean',
      description: 'Optional default when the screen loads (user can still toggle).',
      initialValue: false,
    },
  ],
}
