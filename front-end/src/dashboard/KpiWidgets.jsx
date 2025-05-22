// src/components/KpiWidgets_Style3.js
import React from 'react';

// KpiCard Component - Style 3 (No changes needed to this component itself)
const KpiCardStyle3 = ({ title, value, icon, change, changeType, period, mainColor = "text-blue-600" }) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-4">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">{title}</h3>
        {icon && <div className={`text-lg ${mainColor} opacity-80`}>{icon}</div>}
      </div>
      <p className={`text-2xl font-bold ${mainColor}`}>{value}</p>
      {change && period && (
        <div className={`mt-2 text-sm font-semibold ${changeType === 'positive' ? 'text-green-500' : 'text-red-500'}`}>
          {changeType === 'positive' ? '▲' : '▼'} {change}
          <span className="text-xs text-gray-500 font-normal ml-1">({period})</span>
        </div>
      )}
    </div>
  );
};

// KpiSection Component - Uses Style 3 Cards
// Updated kpiData to include "Calls Made" and "Appointments Set"
const KpiSectionStyle3 = () => {
  const kpiData = [
    {
      id: 1,
      title: 'سرنخ‌ها (هفته)', // Leads (Week)
      value: '۲۷',
      icon: '👥', // User group icon
      change: '۵+',
      changeType: 'positive',
      period: 'هفته قبل', // Last week
      mainColor: 'text-sky-600',
    },
    {
      id: 2,
      title: 'تماس‌ها (امروز)', // Calls (Today)
      value: '۱۵',
      icon: '📞', // Phone icon
      change: '۳+',
      changeType: 'positive',
      period: 'دیروز', // Yesterday
      mainColor: 'text-teal-600',
    },
    {
      id: 3,
      title: 'قرارها (هفته)', // Appointments (Week)
      value: '۸',
      icon: '📅', // Calendar icon
      // No change data for this example, or could be vs last week's appointments
      period: 'این هفته', // This week
      mainColor: 'text-amber-600',
    },
    {
      id: 4,
      title: 'معاملات فعال', // Active Deals
      value: '۱۲',
      icon: '✍️', // Writing hand icon
      change: '۱-',
      changeType: 'negative',
      period: 'ماه قبل', // Last month
      mainColor: 'text-indigo-600',
    },
    // You might want to adjust to 4 or 6 KPIs for a balanced row.
    // If you want exactly 4, you can replace one of the above or decide which are most important.
    // Example with 6 KPIs (will wrap to two rows on smaller screens if grid-cols-2 md:grid-cols-4 is kept):
    // Or adjust grid to be grid-cols-2 md:grid-cols-3 lg:grid-cols-6 for a single row of 6 if space allows
    /*
    {
      id: 5,
      title: 'بازدید ملک (هفته)', // Property Showings (Week)
      value: '۶',
      icon: '🏠', // House icon
      mainColor: 'text-rose-600',
    },
    {
      id: 6,
      title: 'کمیسیون (ماه)', // Commission (Month)
      value: '۴۲۰م ت',
      icon: '💰', // Money bag icon
      change: '۱۵٪+',
      changeType: 'positive',
      period: 'ماه قبل', // Last month
      mainColor: 'text-emerald-600',
    },
    */
  ];

  // For the compact Style 3, let's ensure good spacing.
  // If you have exactly 4 KPIs, `grid-cols-2 md:grid-cols-4` is good.
  // If you decide on 5 or 6, you might consider `grid-cols-2 md:grid-cols-3 lg:grid-cols-X` where X is 5 or 6.
  // For now, assuming we stick to 4 main KPIs for the row:
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
      {kpiData.slice(0, 4).map((kpi) => ( // Displaying first 4 for a clean row
        <KpiCardStyle3
          key={kpi.id}
          title={kpi.title}
          value={kpi.value}
          icon={kpi.icon}
          change={kpi.change}
          changeType={kpi.changeType}
          period={kpi.period}
          mainColor={kpi.mainColor}
        />
      ))}
    </div>
  );
};

export default KpiSectionStyle3;
