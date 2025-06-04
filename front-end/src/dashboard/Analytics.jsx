// src/AnalyticsDashboardSection.js
import React from 'react';
import KpiSection from './KpiWidgets.jsx'; // Assuming KpiWidgets is in src/
import FilePriceDiversity from "./filePriceDiversity.jsx"
import PropertyTypeDiversity from "./propertyTypeDiversity.jsx"
import CustomerBudgetDiversity from "./customerBudgetDiversity.jsx"
import FilePerDay from "./filePerDay.jsx"

// Placeholder components - you'll build these out later
const PropertyChartsWidget = () => (
  <div className="bg-white shadow-lg rounded-xl p-6">
    <h2 className="text-xl font-semibold text-gray-700 mb-4">تحلیل و بررسی املاک</h2>
    {/* TODO: Implement charts here */}
    <p className="text-gray-500">نمودارها و گراف‌های مربوط به عملکرد املاک...</p>
  </div>
);

const CustomerInfoWidget = () => (
  <div className="bg-white shadow-lg rounded-xl p-6">
    <h2 className="text-xl font-semibold text-gray-700 mb-4">اطلاعات مشتریان</h2>
    {/* TODO: Implement customer info display here */}
    <p className="text-gray-500">خلاصه‌ها و آمار مربوط به مشتریان...</p>
  </div>
);

function AnalyticsDashboardSection() {
  return (
    <section className="mb-8">


      {/* Row 2: Charts and Info Widgets */}
      <div className="grid grid-cols-2  gap-3 pl-4">
	<FilePriceDiversity />
	<PropertyTypeDiversity />
	<CustomerBudgetDiversity />
      </div>
      {/* You can add more rows or widgets here as needed */}
    </section>
  );
}

export default AnalyticsDashboardSection;
