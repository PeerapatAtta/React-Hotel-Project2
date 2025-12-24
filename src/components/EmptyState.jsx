import { SearchX } from 'lucide-react'
import Button from './Button'

export default function EmptyState({ 
  title = 'ไม่พบข้อมูล',
  description,
  actionLabel,
  onAction,
  className = '' 
}) {
  return (
    <div className={`flex flex-col items-center justify-center gap-6 py-20 text-center ${className}`}>
      <div className="rounded-full bg-slate-50 p-5 shadow-sm">
        <SearchX size={40} className="text-slate-400" />
      </div>
      <div className="space-y-3 max-w-md">
        <h3 className="text-xl font-semibold text-slate-700">{title}</h3>
        {description && (
          <p className="text-sm leading-relaxed text-slate-500">{description}</p>
        )}
      </div>
      {actionLabel && onAction && (
        <Button variant="ghost" onClick={onAction} className="mt-2">
          {actionLabel}
        </Button>
      )}
    </div>
  )
}

