import { api } from "../common/api";
import { useState, useEffect } from "react";
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

const PropertyDiversity = () => {
  const [chartData, setChartData] = useState(null);
  const [fileType, setFileType] = useState("sell");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await api.get("dashboard/property-type-diversity/");
        const uncleaned_data = response.data[fileType];
        
        setChartData({
          labels: uncleaned_data.map(type => type.type),
          values: uncleaned_data.map(type => type.percentage),
          total: uncleaned_data.reduce((sum, type) => sum + type.percentage, 0)
        });
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [fileType]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!chartData) return null;

  const data = {
    labels: chartData.labels,
    datasets: [{
      label: 'نسبت انواع ملک',
      data: chartData.values,
      backgroundColor: [
        'rgba(99, 102, 241, 0.7)',
        'rgba(59, 130, 246, 0.7)',
        'rgba(16, 185, 129, 0.7)',
        'rgba(245, 158, 11, 0.7)',
        'rgba(239, 68, 68, 0.7)',
      ],
      borderColor: [
        'rgba(99, 102, 241, 1)',
        'rgba(59, 130, 246, 1)',
        'rgba(16, 185, 129, 1)',
        'rgba(245, 158, 11, 1)',
        'rgba(239, 68, 68, 1)',
      ],
      borderWidth: 1,
      hoverOffset: 10
    }]
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-md font-medium text-gray-800">
          توزیع نوع ملک ({fileType === "sell" ? "فروش" : "اجاره"})
        </h3>
        <select 
          value={fileType} // Add this to control the selected value
          onChange={(e) => setFileType(e.target.value)}
          className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="sell">فروش</option>
          <option value="rent">اجاره</option>
        </select>
      </div>
      
      <div className="h-64">
        <Doughnut 
          data={data}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
                rtl: true,
                labels: {
                  usePointStyle: true,
                  padding: 20,
                  font: {
                    family: 'Vazir, sans-serif'
                  }
                }
              },
              tooltip: {
                rtl: true,
                callbacks: {
                  label: function(context) {
                    const total = chartData.total;
                    const value = context.raw;
                    const percentage = Math.round((value / total) * 100);
                    return `${context.label}: ${percentage}% (${value})`;
                  }
                }
              }
            },
            cutout: '70%',
            animation: {
              animateScale: true,
              animateRotate: true
            }
          }}
        />
      </div>
    </div>
  );
}

export default PropertyDiversity;
