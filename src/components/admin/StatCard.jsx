import React from 'react'

export default function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendUp = true,
  className = '' 
}) {
  return (
    <div className={`rounded-2xl border border-slate-100 bg-white p-6 shadow-sm ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-primary">{value}</p>
          {trend && (
            <div className={`mt-3 flex items-center gap-1.5 text-xs font-semibold ${
              trendUp ? 'text-teal-600' : 'text-slate-500'
            }`}>
              <span>{trend}</span>
              {trendUp && (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              )}
            </div>
          )}
        </div>
        {Icon && (
          <div className="rounded-xl bg-teal-50 p-3">
            <Icon size={24} className="text-teal-600" />
          </div>
        )}
      </div>
    </div>
  )
}

