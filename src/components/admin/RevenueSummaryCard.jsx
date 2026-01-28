import React, { useMemo } from 'react'
import { DollarSign, TrendingUp, Calendar, ArrowRight } from 'lucide-react'

// Custom Thai Baht icon component
const BathIcon = ({ size = 20, className = '' }) => (
  <div 
    className={className}
    style={{ 
      fontSize: `${size * 0.85}px`,
      lineHeight: 1,
      fontWeight: 'bold',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: `${size}px`,
      height: `${size}px`
    }}
  >
    ฿
  </div>
)

export default function RevenueSummaryCard({ 
  totalRevenue = 0, 
  todayRevenue = 0, 
  monthlyRevenue = [],
  totalBookings = 0 
}) {
  // คำนวณตัวเลขต่างๆ
  const stats = useMemo(() => {
    const total6Months = monthlyRevenue.reduce((sum, item) => sum + (item.revenue || 0), 0)
    const averagePerBooking = totalBookings > 0 ? totalRevenue / totalBookings : 0
    const lastMonthRevenue = monthlyRevenue.length > 0 ? monthlyRevenue[monthlyRevenue.length - 1]?.revenue || 0 : 0
    const secondLastMonthRevenue = monthlyRevenue.length > 1 ? monthlyRevenue[monthlyRevenue.length - 2]?.revenue || 0 : 0
    const monthlyGrowth = secondLastMonthRevenue > 0 
      ? ((lastMonthRevenue - secondLastMonthRevenue) / secondLastMonthRevenue) * 100 
      : 0

    return {
      totalRevenue,
      todayRevenue,
      total6Months,
      averagePerBooking,
      monthlyGrowth,
      lastMonthRevenue,
    }
  }, [totalRevenue, todayRevenue, monthlyRevenue, totalBookings])

  return (
    <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-teal-50">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-emerald-100 p-3">
            <DollarSign size={24} className="text-emerald-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-primary">สรุปรายได้</h2>
            <p className="text-sm text-slate-500 mt-0.5">ภาพรวมรายได้ทั้งหมด</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* รายได้หลัก */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-slate-500" />
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
              รายได้หลัก
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* รายได้รวม */}
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-emerald-700">รายได้รวม</p>
                <BathIcon size={16} className="text-emerald-600" />
              </div>
              <p className="text-2xl font-bold text-emerald-600">
                ฿{Math.round(stats.totalRevenue).toLocaleString()}
              </p>
              {stats.monthlyGrowth !== 0 && (
                <p className={`text-xs mt-1 ${stats.monthlyGrowth > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {stats.monthlyGrowth > 0 ? '+' : ''}{stats.monthlyGrowth.toFixed(1)}% จากเดือนที่แล้ว
                </p>
              )}
            </div>

            {/* รายได้วันนี้ */}
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-blue-700">รายได้วันนี้</p>
                <Calendar size={16} className="text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-blue-600">
                ฿{Math.round(stats.todayRevenue).toLocaleString()}
              </p>
              {stats.totalRevenue > 0 && (
                <p className="text-xs text-blue-600 mt-1">
                  {((stats.todayRevenue / stats.totalRevenue) * 100).toFixed(1)}% ของรายได้รวม
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-200 my-6"></div>

        {/* สถิติเพิ่มเติม */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-slate-500" />
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
              สถิติเพิ่มเติม
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* รายได้เฉลี่ยต่อการจอง */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-slate-600">รายได้เฉลี่ยต่อการจอง</p>
                <BathIcon size={16} className="text-slate-500" />
              </div>
              <p className="text-2xl font-bold text-slate-700">
                ฿{Math.round(stats.averagePerBooking).toLocaleString()}
              </p>
            </div>

            {/* รายได้ 6 เดือน */}
            <div className="rounded-xl border border-teal-200 bg-teal-50 p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-teal-700">รายได้ 6 เดือน</p>
                <TrendingUp size={16} className="text-teal-600" />
              </div>
              <p className="text-2xl font-bold text-teal-600">
                ฿{Math.round(stats.total6Months).toLocaleString()}
              </p>
              {stats.totalRevenue > 0 && (
                <p className="text-xs text-teal-600 mt-1">
                  {((stats.total6Months / stats.totalRevenue) * 100).toFixed(1)}% ของรายได้รวม
                </p>
              )}
            </div>
          </div>
        </div>

        {/* รายได้รายเดือน (สรุป) */}
        {monthlyRevenue.length > 0 && (
          <>
            <div className="border-t border-slate-200 my-6"></div>
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Calendar size={18} className="text-slate-500" />
                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                  รายได้รายเดือน (6 เดือนล่าสุด)
                </h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {monthlyRevenue.slice(-6).map((item, index) => (
                  <div key={index} className="rounded-lg border border-slate-200 bg-white p-3">
                    <p className="text-xs font-medium text-slate-600 mb-1">{item.month}</p>
                    <p className="text-sm font-bold text-primary">
                      ฿{Math.round(item.revenue || 0).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
