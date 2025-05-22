import React from 'react';
import Card from './Card';
import { UserPlusIcon, CheckBadgeIcon } from '@heroicons/react/24/outline';

const mockNewLeads = [
  { id: 1, name: "Alice Wonderland", source: "Zillow", received: "2h ago" },
  { id: 2, name: "Bob The Builder", source: "Website", received: "5h ago" },
];

function NewLeadsWidget() {
  const newLeadsCount = mockNewLeads.length;

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-slate-700">New Leads</h2>
        {newLeadsCount > 0 && (
          <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            {newLeadsCount}
          </span>
        )}
      </div>
      {newLeadsCount > 0 ? (
        <ul className="space-y-2">
          {mockNewLeads.map(lead => (
            <li key={lead.id} className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex justify-between items-center">
              <div>
                <p className="font-medium text-slate-800">{lead.name}</p>
                <p className="text-xs text-slate-500">From: {lead.source} • {lead.received}</p>
              </div>
              <button className="text-green-500 hover:text-green-700 p-1" title="Qualify">
                <CheckBadgeIcon className="h-6 w-6" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-slate-500">No new leads at the moment.</p>
      )}
    </Card>
  );
}

export default NewLeadsWidget;
