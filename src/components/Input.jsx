import React from 'react'

export default function Input({
  label,
  error,
  helperText,
  className = '',
  type = 'text',
  ...props
}) {
  return (
    <label className="block">
      {label && (
        <span className="mb-1.5 inline-block text-xs font-semibold uppercase tracking-wide text-slate-600">
          {label}
        </span>
      )}
      <input
        type={type}
        className={`w-full rounded-xl border px-4 py-2.5 text-sm text-slate-700 shadow-sm transition-all duration-200 ${props.disabled
            ? 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed'
            : error
              ? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-2 focus:ring-red-200'
              : 'border-slate-200 bg-white focus:border-accent focus:ring-2 focus:ring-accent/20'
          } focus:outline-none ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1.5 text-xs font-medium text-red-500">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1.5 text-xs text-slate-500">{helperText}</p>
      )}
    </label>
  )
}

