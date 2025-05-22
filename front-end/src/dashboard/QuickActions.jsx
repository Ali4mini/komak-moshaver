import React from 'react';
import { PlusCircleIcon, UserPlusIcon, BuildingOfficeIcon} from '@heroicons/react/24/outline';

const actions = [
  { name: 'New Lead', icon: UserPlusIcon, color: 'bg-green-500 hover:bg-green-600' },
  { name: 'New Contact', icon: UserPlusIcon, color: 'bg-blue-500 hover:bg-blue-600' },
  { name: 'New Listing', icon: BuildingOfficeIcon, color: 'bg-purple-500 hover:bg-purple-600' },
  // { name: 'New Appointment', icon: CalendarPlusIcon, color: 'bg-orange-500 hover:bg-orange-600' },
];

function QuickActions() {
  return (
    <div className="bg-white shadow-lg rounded-xl p-4 mb-6">
      <h2 className="text-lg font-semibold text-slate-700 mb-3">Quick Actions</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {actions.map(action => (
          <button
            key={action.name}
            className={`flex flex-col items-center justify-center p-3 ${action.color} text-white rounded-lg transition duration-150 text-sm font-medium space-y-1`}
          >
            <action.icon className="h-6 w-6 mb-1" />
            <span>{action.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default QuickActions;
