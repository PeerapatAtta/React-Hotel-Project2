import { AlertCircle } from 'lucide-react'
import Button from './Button'

export default function ErrorState({ 
  title = 'เกิดข้อผิดพลาด',
  description,
  actionLabel = 'ลองอีกครั้ง',
  onAction,
  className = '' 
}) {
  return (
    <div className={`flex flex-col items-center justify-center gap-6 py-20 text-center ${className}`}>
      <div className="rounded-full bg-red-50 p-5 shadow-sm">
        <AlertCircle size={40} className="text-red-400" />
      </div>
      <div className="space-y-3 max-w-md">
        <h3 className="text-xl font-semibold text-slate-700">{title}</h3>
        {description && (
          <p className="text-sm leading-relaxed text-slate-500">{description}</p>
        )}
      </div>
      {onAction && (
        <Button variant="ghost" onClick={onAction} className="mt-2">
          {actionLabel}
        </Button>
      )}
    </div>
  )
}

