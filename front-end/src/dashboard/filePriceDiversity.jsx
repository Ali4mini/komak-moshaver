import { api } from "../common/api";
import { useState, useEffect } from "react";
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

const FilePriceDiversity = () => {
  const [chartData, setChartData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get("dashboard/file-price-diversity/");
        const uncleaned_data = response.data;
        
        setChartData({
          labels: [
            "زیر ۲ میلیارد",
            "بین ۲ و ۳ میلیارد",
            "بین ۳ و ۵ میلیارد",
            "بین ۵ و ۸ میلیارد",
            "بیشتر از ۸ میلیارد",
          ],
          values: [
            uncleaned_data["below_2000"],
            uncleaned_data["2000_3000"],
            uncleaned_data["3000_5000"],
            uncleaned_data["5000_8000"],
            uncleaned_data["higher_8000"]
          ]
        });
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

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
      label: 'تعداد فایل ها',
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
      <h4 className="text-md font-medium text-gray-800 mb-3 text-center">
        توزیع قیمت فایل‌ های فروش
      </h4>
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
                    return `${context.label}: ${context.raw} فایل`;
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

export default FilePriceDiversity;
