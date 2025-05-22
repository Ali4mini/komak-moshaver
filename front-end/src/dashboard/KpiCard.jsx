import React from 'react';
import Card from './Card'; // Assuming Card is in the same directory or adjust path

function KpiCard({ title, value, icon, change, changeType = 'positive', unit = '' }) {
  const IconComponent = icon;
  const changeColor = changeType === 'positive' ? 'text-green-500' : 'text-red-500';
  const changeIcon = changeType === 'positive' ? '▲' : '▼';

  return (
    <Card className="text-center md:text-left">
      <div className="flex flex-col md:flex-row items-center md:items-start">
        {IconComponent && (
          <div className="bg-blue-100 text-blue-500 p-3 rounded-full mb-3 md:mb-0 md:mr-4">
            <IconComponent className="h-6 w-6" />
          </div>
        )}
        <div>
          <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">{title}</h3>
          <p className="text-3xl font-bold text-slate-800">
            {value}
            {unit && <span className="text-xl font-medium">{unit}</span>}
          </p>
          {change && (
            <p className={`text-sm font-medium ${changeColor}`}>
              {changeIcon} {change} vs last period
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}

export default KpiCard;
