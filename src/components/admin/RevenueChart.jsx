import React from 'react'
import { TrendingUp } from 'lucide-react'

export default function RevenueChart({ data }) {
  // ตรวจสอบว่า data มีค่าหรือไม่
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-primary">รายได้รายเดือน</h2>
            <p className="text-sm text-slate-500 mt-1">ย้อนหลัง 6 เดือน</p>
          </div>
          <div className="rounded-lg bg-teal-50 p-2">
            <TrendingUp size={20} className="text-teal-600" />
          </div>
        </div>
        <div className="text-center py-8 text-slate-500">
          <p>ยังไม่มีข้อมูลรายได้</p>
        </div>
      </div>
    )
  }

  const maxRevenue = Math.max(...data.map(d => d.revenue || 0))
  
  return (
    <div className="rounded-2xl border border-slate-100 bg-white shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-primary">รายได้รายเดือน</h2>
          <p className="text-sm text-slate-500 mt-1">ย้อนหลัง 6 เดือน</p>
        </div>
        <div className="rounded-lg bg-teal-50 p-2">
          <TrendingUp size={20} className="text-teal-600" />
        </div>
      </div>
      
      <div className="space-y-4">
        {data.map((item, index) => {
          const revenue = item.revenue || 0
          const percentage = maxRevenue > 0 ? (revenue / maxRevenue) * 100 : 0
          return (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700">{item.month}</span>
                <span className="font-semibold text-primary">
                  ฿{revenue.toLocaleString()}
                </span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-teal-500 to-teal-600 rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
      
      <div className="mt-6 pt-6 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-600">รายได้รวม 6 เดือน</span>
          <span className="text-xl font-bold text-teal-600">
            ฿{data.reduce((sum, item) => sum + (item.revenue || 0), 0).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  )
}

