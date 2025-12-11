import React from 'react'
import {StringInputProps, set} from 'sanity'
import AccountBalanceIcon from '@mui/icons-material/AccountBalance'
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd'
import CottageIcon from '@mui/icons-material/Cottage'
import ArticleIcon from '@mui/icons-material/Article'
import BadgeIcon from '@mui/icons-material/Badge'

// Icon options with actual MUI icons
const iconOptions = [
  {value: 'account_balance', label: 'Account Balance', Icon: AccountBalanceIcon},
  {value: 'assignment_ind', label: 'Assignment Ind', Icon: AssignmentIndIcon},
  {value: 'cottage', label: 'Cottage', Icon: CottageIcon},
  {value: 'article', label: 'Article', Icon: ArticleIcon},
  {value: 'passport', label: 'Passport', Icon: BadgeIcon},
]

export function IconSelector(props: StringInputProps) {
  const {value, onChange} = props

  return (
    <div style={{padding: '1rem'}}>
      <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 'bold'}}>
        Module Icon
      </label>
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '1rem'}}>
        {iconOptions.map((option) => {
          const IconComponent = option.Icon
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(set(option.value))}
              style={{
                padding: '1.5rem 1rem',
                border: value === option.value ? '2px solid #0066cc' : '1px solid #ddd',
                borderRadius: '8px',
                background: value === option.value ? '#e6f2ff' : '#fff',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                if (value !== option.value) {
                  e.currentTarget.style.background = '#f5f5f5'
                }
              }}
              onMouseLeave={(e) => {
                if (value !== option.value) {
                  e.currentTarget.style.background = '#fff'
                }
              }}
            >
              <IconComponent 
                sx={{ 
                  fontSize: '2.5rem',
                  color: value === option.value ? '#0066cc' : '#666'
                }} 
              />
              <span style={{fontSize: '0.75rem', textAlign: 'center', color: '#666', fontWeight: 500}}>
                {option.label}
              </span>
              <span style={{fontSize: '0.65rem', color: '#999', fontFamily: 'monospace'}}>
                {option.value}
              </span>
            </button>
          )
        })}
      </div>
      {value && (
        <div style={{marginTop: '1rem', padding: '0.75rem', background: '#f9f9f9', borderRadius: '4px'}}>
          <strong>Selected:</strong> <code>{value}</code>
        </div>
      )}
    </div>
  )
}

