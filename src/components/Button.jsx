import React from 'react'

const variants = {
  primary:
    'bg-teal-600 text-white shadow-md shadow-teal-600/20 hover:bg-teal-700 hover:text-white hover:shadow-lg hover:shadow-teal-700/40 border border-transparent focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:ring-offset-2 transition-all duration-200',
  secondary:
    'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-300/50 focus:ring-offset-2 transition-all duration-200',
  ghost: 'bg-white text-teal-600 border border-slate-200 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-300/50 focus:ring-offset-2 transition-all duration-200',
}

export default function Button({
  variant = 'primary',
  className = '',
  children,
  ...props
}) {
  const variantClass = variants[variant] ?? variants.primary
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold ${variantClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

