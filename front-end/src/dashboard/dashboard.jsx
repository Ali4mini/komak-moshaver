import React from 'react';
import TodayTasks from './TodayTasks.jsx'; // Adjust path if needed

function Dashboard() {
  return (
    <div className="min-h-screen bg-slate-100 text-gray-800 p-4 md:p-6 lg:p-8" dir="rtl">

      <main className="container mx-auto">
        <div className="grid grid-cols-1  gap-6 md:gap-8">
          <div className="lg:col-span-1">
            <TodayTasks />
          </div>
          {/* Future components will be added to this grid */}
        </div>
      </main>

    </div>
  );
}

export default Dashboard;
