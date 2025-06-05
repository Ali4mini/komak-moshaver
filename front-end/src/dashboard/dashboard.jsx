// src/Dashboard.js
import React from 'react';
import AnalyticsDashboardSection from './Analytics.jsx'; // Adjust path if you put it in /components
import AgentToolsDashboardSection from './AgentTools.jsx';   // Adjust path if you put it in /components
import KpiSection from './KpiWidgets.jsx'; // Assuming KpiWidgets is in src/
import QuickAccess from './QuickActions.jsx';

function Dashboard() {
  return (
    <div className="grid grid-cols-1 min-h-screen bg-slate-100 text-gray-800 p-4 md:p-6 lg:p-8" dir="rtl">
      <main className="flex flex-col w-full">
          <div className="flex flex-row justify-between mt-4">
	    <KpiSection />
	    <QuickAccess />
          </div>


	  <div className="flex flex-row justify-between">

	    <AnalyticsDashboardSection />
	    <AgentToolsDashboardSection />

	  </div>

      </main>
    </div>
  );
}

export default Dashboard;
