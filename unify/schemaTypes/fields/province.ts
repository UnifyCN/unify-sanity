import {defineField} from 'sanity'

const CANADIAN_PROVINCES = [
  'Alberta',
  'British Columbia',
  'Manitoba',
  'New Brunswick',
  'Newfoundland and Labrador',
  'Northwest Territories',
  'Nova Scotia',
  'Nunavut',
  'Ontario',
  'Prince Edward Island',
  'Quebec',
  'Saskatchewan',
  'Yukon',
]

export const provinceField = defineField({
  name: 'province',
  title: 'Province or territory',
  type: 'string',
  description: 'Select one province or territory for local content. Leave empty for national content.',
  options: {
    list: CANADIAN_PROVINCES.map((province) => ({title: province, value: province})),
    layout: 'dropdown',
  },
  validation: (rule) =>
    rule.custom((value) =>
      !value || CANADIAN_PROVINCES.includes(value)
        ? true
        : 'Select a Canadian province or territory, or leave empty for national content.',
    ),
})
