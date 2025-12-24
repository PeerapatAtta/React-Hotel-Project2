export default function SectionTitle({ 
  subtitle, 
  title, 
  description,
  className = '' 
}) {
  return (
    <header className={`space-y-2 ${className}`}>
      {subtitle && (
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400" style={{ color: '#94a3b8' }}>
          {subtitle}
        </p>
      )}
      {title && (
        <h2 className="text-2xl font-bold text-primary md:text-3xl" style={{ color: '#1f2933' }}>
          {title}
        </h2>
      )}
      {description && (
        <p className="text-sm text-slate-500 md:text-base" style={{ color: '#64748b' }}>
          {description}
        </p>
      )}
    </header>
  )
}

