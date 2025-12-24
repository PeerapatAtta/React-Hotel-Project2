import { Loader2 } from 'lucide-react'

export default function LoadingSpinner({ text = 'กำลังโหลด...', className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-5 py-20 ${className}`}>
      <div className="rounded-full bg-slate-50 p-4 shadow-sm">
        <Loader2 className="animate-spin text-accent" size={36} />
      </div>
      <p className="text-sm font-medium text-slate-600">{text}</p>
    </div>
  )
}

