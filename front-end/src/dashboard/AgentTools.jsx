// src/AgentToolsDashboardSection.js
import React from 'react';
import TodayTasks from './TodayTasks';
import UpcomingAppointments from './UpcomingAppoinments.jsx';
import QuickAccess from './QuickActions.jsx';

function AgentToolsDashboardSection() {
  return (
    <section>
      <div className="grid grid-cols-2 gap-3">
        {/* Column 1: Today's Tasks */}
        <div className="lg:col-span-1">
          <TodayTasks />
        </div>

        {/* Column 2: Upcoming Appointments */}
        <div className="lg:col-span-1">
          <UpcomingAppointments />
        </div>

      </div>
    </section>
  );
}

export default AgentToolsDashboardSection;
