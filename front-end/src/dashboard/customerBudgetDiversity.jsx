import { api } from "../common/api";
import { useState, useEffect } from "react";
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { motion } from "framer-motion";

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

const CustomerBudgetDiversity = () => {
  const [chartData, setChartData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get("dashboard/customer-budget-diversity/");
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
          ],
          total: Object.values(uncleaned_data).reduce((sum, val) => sum + val, 0)
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
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center h-64"
      >
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </motion.div>
    );
  }

  if (!chartData) return null;

  const data = {
    labels: chartData.labels,
    datasets: [{
      label: 'تعداد مشتریان',
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white p-4 rounded-xl shadow-md border border-gray-100"
    >
      <motion.h3 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-lg font-semibold text-gray-800 mb-4 text-center"
      >
        تنوع بودجه مشتریان
      </motion.h3>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="h-64"
      >
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
                    const label = context.label || '';
                    const value = context.raw || 0;
                    const percentage = Math.round((value / chartData.total) * 100);
                    return `${label}: ${value} نفر (${percentage}%)`;
                  }
                }
              }
            },
            cutout: '70%',
            animation: {
              animateScale: true,
              animateRotate: true,
              duration: 1000,
              easing: 'easeOutQuart'
            }
          }}
        />
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-4 text-center text-sm text-gray-500"
      >
        مجموع: {chartData.total.toLocaleString()} مشتری
      </motion.div>
    </motion.div>
  );
}

export default CustomerBudgetDiversity;
