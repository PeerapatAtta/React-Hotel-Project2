export default function IconLabel({ 
  icon: Icon, 
  text, 
  size = 16,
  className = '' 
}) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <Icon size={size} className="flex-shrink-0 text-slate-500" />
      <span className="text-sm text-slate-600">{text}</span>
    </div>
  )
}

