import React from 'react'

export default function Card({ 
  children, 
  className = '', 
  hover = false,
  ...props 
}) {
  return (
    <article
      className={`flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm shadow-slate-200/40 transition-all duration-300 ${
        hover ? 'hover:shadow-md hover:shadow-slate-200/60 hover:-translate-y-0.5' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </article>
  )
}

