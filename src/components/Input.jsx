import React from 'react'

export default function Input({
  label,
  error,
  helperText,
  className = '',
  type = 'text',
  disabled = false,
  ...props
}) {
  return (
    <label className="block">
      {label && (
        <span className={`mb-1.5 inline-block text-xs font-semibold uppercase tracking-wide ${
          disabled ? 'text-slate-400' : 'text-slate-600'
        }`}>
          {label}
        </span>
      )}
      <input
        type={type}
        disabled={disabled}
        className={`w-full rounded-xl border px-4 py-2.5 text-sm shadow-sm transition-all duration-200 ${
          disabled
            ? 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed'
            : error
            ? 'border-red-300 bg-red-50 text-slate-700 focus:border-red-400 focus:ring-2 focus:ring-red-200'
            : 'border-slate-200 bg-white text-slate-700 focus:border-accent focus:ring-2 focus:ring-accent/20'
        } focus:outline-none ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1.5 text-xs font-medium text-red-500">{error}</p>
      )}
      {helperText && !error && (
        <p className={`mt-1.5 text-xs ${disabled ? 'text-slate-400' : 'text-slate-500'}`}>
          {helperText}
        </p>
      )}
    </label>
  )
}

