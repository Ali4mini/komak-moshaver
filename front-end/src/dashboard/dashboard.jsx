// src/Dashboard.js
import React from 'react';
import TodayTasks from './TodayTasks'; // Assuming in src/ or src/components/
import KpiSection from './KpiWidgets.jsx';
import UpcomingAppointments from './UpcomingAppoinments.jsx';
import QuickAccess from './QuickActions.jsx';

function Dashboard() {
  return (
    <div className="min-h-screen bg-slate-100 text-gray-800 p-4 md:p-6 lg:p-8" dir="rtl">
      <main className="container mx-auto">
        {/* Row 1: KPIs */}
        <KpiSection />

        {/* Row 2: Main Content Grid (Tasks, Appointments, Quick Access) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 md:gap-8 mt-6 md:mt-8">
          {/* Column 1: Today's Tasks */}
          <div className="md:col-span-1 lg:col-span-1"> {/* Explicitly setting col-span */}
            <TodayTasks />
          </div>

          {/* Column 2: Upcoming Appointments */}
          <div className="md:col-span-1 lg:col-span-1"> {/* Explicitly setting col-span */}
            <UpcomingAppointments />
          </div>

          {/* Column 3: Quick Access (and potentially other small widgets) */}
          <div className="md:col-span-2 lg:col-span-1 space-y-6 md:space-y-8"> {/* On medium screens, QA might take 2 cols if it's alone, then 1 on large */}
                                                                               {/* Or simply md:col-span-1 lg:col-span-1 if it's always the third distinct column */}
            <QuickAccess />
            {/* You could stack another small widget here if needed */}
            {/* Example:
            <div className="bg-white shadow-lg rounded-xl p-6">
              <h2 className="text-xl font-semibold text-gray-700">Widget الصغير دیگر</h2>
              <p>محتوا...</p>
            </div>
            */}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
