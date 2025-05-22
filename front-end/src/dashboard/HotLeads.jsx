import React from 'react';
import Card from './Card';
import { FireIcon, PhoneIcon, EnvelopeIcon } from '@heroicons/react/24/solid';

const mockHotLeads = [
  { id: 1, name: "Sarah Connor", status: "Hot", lastContact: "2 days ago", nextStep: "Call to schedule showing" },
  { id: 2, name: "Kyle Reese", status: "Warm", lastContact: "Yesterday", nextStep: "Send property matches" },
  { id: 3, name: "Miles Dyson", status: "Hot", lastContact: "5 hours ago", nextStep: "Follow up on offer" },
];

function HotLeads() {
  return (
    <Card title="Hot Leads & Follow-Ups">
      <ul className="space-y-3">
        {mockHotLeads.map(lead => (
          <li key={lead.id} className="p-3 rounded-lg border border-amber-300 bg-amber-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FireIcon className="h-6 w-6 text-red-500 mr-2" />
                <div>
                  <p className="font-semibold text-slate-800">{lead.name}</p>
                  <p className="text-xs text-slate-500">Last contact: {lead.lastContact}</p>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                lead.status === 'Hot' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
              }`}>
                {lead.status}
              </span>
            </div>
            <p className="text-sm text-slate-600 mt-1 ml-8">Next: {lead.nextStep}</p>
            <div className="mt-2 ml-8 flex space-x-2">
              <button className="p-1 text-blue-500 hover:text-blue-700"><PhoneIcon className="h-5 w-5"/></button>
              <button className="p-1 text-blue-500 hover:text-blue-700"><EnvelopeIcon className="h-5 w-5"/></button>
            </div>
          </li>
        ))}
      </ul>
       <button className="mt-4 w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-150">
        View All Leads
      </button>
    </Card>
  );
}

export default HotLeads;
