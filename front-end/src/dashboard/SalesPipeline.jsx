import React from 'react';
import Card from './Card';

const pipelineData = [
  { stage: 'New Leads', count: 25, value: 12500000, color: 'bg-sky-500' },
  { stage: 'Contacted', count: 18, value: 9000000, color: 'bg-blue-500' },
  { stage: 'Showing', count: 10, value: 5000000, color: 'bg-indigo-500' },
  { stage: 'Offer Made', count: 4, value: 2000000, color: 'bg-purple-500' },
  { stage: 'Under Contract', count: 2, value: 1000000, color: 'bg-pink-500' },
];

// Function to format currency (simplified)
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
}

function SalesPipeline() {
  const totalPotentialValue = pipelineData.reduce((sum, stage) => sum + stage.value, 0);

  return (
    <Card title="Sales Pipeline" className="col-span-1 md:col-span-2"> {/* Takes more space */}
      <div className="mb-4 text-right">
        <p className="text-sm text-slate-500">Total Potential Value</p>
        <p className="text-2xl font-bold text-green-600">{formatCurrency(totalPotentialValue)}</p>
      </div>
      <div className="space-y-4">
        {pipelineData.map(item => (
          <div key={item.stage}>
            <div className="flex justify-between items-center mb-1">
              <span className="font-medium text-slate-700">{item.stage} ({item.count})</span>
              <span className="text-sm text-slate-500">{formatCurrency(item.value)}</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-4">
              <div
                className={`${item.color} h-4 rounded-full`}
                style={{ width: `${(item.count / pipelineData[0].count) * 100}%` }} // Relative to max (New Leads)
              ></div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default SalesPipeline;
