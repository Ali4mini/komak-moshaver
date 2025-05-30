// src/components/KpiWidgets_Style3.js
import React, { useState, useEffect } from 'react';
import { api } from "../common/api";

// KpiCard Component - Style 3 (No changes needed)
const KpiCard = ({ title, value, icon, change, changeType, period, mainColor = "text-blue-600" }) => {
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

// --- Date Helper Functions (can be outside the component if they don't use props/state) ---
const getFormattedDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getStartOfWeek = (date, startDay = 0) => { // startDay: 0 for Sunday, 1 for Monday
  const d = new Date(date);
  const dayOfWeek = d.getDay();
  const diff = d.getDate() - dayOfWeek + (dayOfWeek === 0 && startDay !== 0 ? -7 + startDay : startDay); // Adjust if week starts on Monday and current day is Sunday
  return new Date(d.setDate(diff));
};

const getEndOfWeek = (date, startDay = 0) => {
  const d = getStartOfWeek(new Date(date), startDay); // Get start of week first
  return new Date(d.setDate(d.getDate() + 6)); // Add 6 days to get end of week
};

// --- Change Calculation Helper ---
const calculateChange = (currentStr, previousNum, loadingValue = '...', errorValue = "N/A") => {
  if (currentStr === loadingValue || currentStr === errorValue || previousNum === null || previousNum === undefined) {
    return { change: '', changeType: 'positive' }; // Default: no change shown
  }

  const currentValue = parseInt(currentStr, 10);
  // previousNum is expected to be a number already or null

  if (isNaN(currentValue) || typeof previousNum !== 'number' || isNaN(previousNum)) {
     return { change: '', changeType: 'positive' }; // Handle cases where parsing fails or previousNum is not a number
  }

  const diff = currentValue - previousNum;

  if (diff > 0) {
    return { change: `${diff}+`, changeType: 'positive' };
  } else if (diff < 0) {
    return { change: `${Math.abs(diff)}-`, changeType: 'negative' };
  } else {
    return { change: '۰', changeType: 'positive' }; // Or 'neutral'
  }
};

// --- Constants for Initial State ---
const LOADING_STATE = '...';
const ERROR_STATE = 'N/A';

// KpiSection Component - Uses Style 3 Cards
const KpiSection = () => {
  // State for individual KPIs
  const [callsData, setCallsData] = useState({ current: LOADING_STATE, previous: null });
  const [customersData, setCustomersData] = useState({ current: LOADING_STATE, previous: null });
  const [filesData, setFilesData] = useState({ current: LOADING_STATE, previous: null });
  const [toursData, setToursData] = useState({ current: LOADING_STATE, previous: null });

  useEffect(() => {
    const fetchAllCounts = async () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);

      const todayStr = getFormattedDate(today);
      const yesterdayStr = getFormattedDate(yesterday);

      // Assuming week starts on Sunday (startDay=0)
      const startOfThisWeek = getStartOfWeek(today, 0);
      const endOfThisWeek = getEndOfWeek(today, 0);
      const startOfThisWeekStr = getFormattedDate(startOfThisWeek);
      const endOfThisWeekStr = getFormattedDate(endOfThisWeek);

      const startOfLastWeek = getStartOfWeek(new Date(today.setDate(today.getDate() - 7)), 0);
      const endOfLastWeek = getEndOfWeek(startOfLastWeek, 0);
      const startOfLastWeekStr = getFormattedDate(startOfLastWeek);
      const endOfLastWeekStr = getFormattedDate(endOfLastWeek);
      
      today.setDate(today.getDate() + 7); // Reset today's date after modification for last week

      try {
        // Fetch data concurrently where possible
        const [
          todayCallsRes,
          yesterdayCallsRes,
          thisWeekCustomersRes,
          lastWeekCustomersRes,
          thisWeekFilesRes,
          lastWeekFilesRes,
          todayToursRes,
          yesterdayToursRes,
        ] = await Promise.all([
          api.get(`dashboard/calls/?start_date=${todayStr}&end_date=${todayStr}`),
          api.get(`dashboard/calls/?start_date=${yesterdayStr}&end_date=${yesterdayStr}`),
          api.get(`listing/customers/?created__gte=${startOfThisWeekStr}&created__lte=${endOfThisWeekStr}&count`),
          api.get(`listing/customers/?created__gte=${startOfLastWeekStr}&created__lte=${endOfLastWeekStr}&count`),
          api.get(`listing/?created__gte=${startOfThisWeekStr}&created__lte=${endOfThisWeekStr}&count`), // Assuming 'listing/' is for FileFilter
          api.get(`listing/?created__gte=${startOfLastWeekStr}&created__lte=${endOfLastWeekStr}&count`),
          api.get(`dashboard/tours/?start_date=${todayStr}&end_date=${todayStr}`),
          api.get(`dashboard/tours/?start_date=${yesterdayStr}&end_date=${yesterdayStr}`),
        ]);

        setCallsData({ current: todayCallsRes.data.count.toString(), previous: yesterdayCallsRes.data.count });
        setCustomersData({ current: thisWeekCustomersRes.data.count.toString(), previous: lastWeekCustomersRes.data.count });
        setFilesData({ current: thisWeekFilesRes.data.count.toString(), previous: lastWeekFilesRes.data.count });
        setToursData({ current: todayToursRes.data.total_tour_count.toString(), previous: yesterdayToursRes.data.total_tour_count });

      } catch (error) {
        console.error("Error fetching counts:", error);
        setCallsData({ current: ERROR_STATE, previous: null });
        setCustomersData({ current: ERROR_STATE, previous: null });
        setFilesData({ current: ERROR_STATE, previous: null });
        setToursData({ current: ERROR_STATE, previous: null });
      }
    };

    fetchAllCounts();
  }, []); // Empty dependency array means run once on mount

  const kpiData = [
    {
      id: 1,
      title: 'مشتری (هفته)',
      value: customersData.current,
      icon: '👥',
      ...calculateChange(customersData.current, customersData.previous, LOADING_STATE, ERROR_STATE),
      period: 'هفته قبل',
      mainColor: 'text-sky-600',
    },
    {
      id: 2,
      title: 'تماس‌ها (امروز)',
      value: callsData.current,
      icon: '📞',
      ...calculateChange(callsData.current, callsData.previous, LOADING_STATE, ERROR_STATE),
      period: 'دیروز',
      mainColor: 'text-teal-600',
    },
    {
      id: 3,
      title: 'بازدید (امروز)',
      value: toursData.current,
      icon: '📅',
      ...calculateChange(toursData.current, toursData.previous, LOADING_STATE, ERROR_STATE),
      period: 'دیروز',
      mainColor: 'text-amber-600',
    },
    {
      id: 4,
      title: 'فایل (هفته)',
      value: filesData.current,
      icon: '📁', // Changed icon for files
      ...calculateChange(filesData.current, filesData.previous, LOADING_STATE, ERROR_STATE),
      period: 'هفته قبل',
      mainColor: 'text-purple-600', // Changed color for distinction
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
      {kpiData.map((kpi) => (
        <KpiCard
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

export default KpiSection;
