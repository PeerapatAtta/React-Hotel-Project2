export default function IconLabel({ 
  icon: Icon, 
  text, 
  size = 16,
  className = '',
  iconText // สำหรับแสดง text แทน icon (เช่น "฿")
}) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {iconText ? (
        <span className="flex-shrink-0 text-slate-500 font-semibold" style={{ fontSize: `${size}px` }}>
          {iconText}
        </span>
      ) : Icon ? (
        <Icon size={size} className="flex-shrink-0 text-slate-500" />
      ) : null}
      <span className="text-sm text-slate-600">{text}</span>
    </div>
  )
}

