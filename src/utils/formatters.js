export function formatPrice(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return value
  }
  // Return formatted price with currency symbol for general use
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatPriceNumber(value) {
  // Handle both number and string (from database)
  if (value === null || value === undefined) {
    return '0'
  }
  
  // Convert string to number if needed
  const numValue = typeof value === 'string' ? parseFloat(value) : value
  
  if (typeof numValue !== 'number' || Number.isNaN(numValue)) {
    return String(value || '0')
  }
  
  // Return formatted number without currency symbol (for use with icon)
  return new Intl.NumberFormat('th-TH', {
    maximumFractionDigits: 0,
  }).format(numValue)
}

export function formatDate(value) {
  if (!value) {
    return ''
  }
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return value
  }
  return parsed.toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

