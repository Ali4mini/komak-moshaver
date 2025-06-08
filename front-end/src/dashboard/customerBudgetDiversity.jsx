// File: CustomerBudgetDiversity.jsx
import { api } from "../common/api";
import { useState, useEffect, useRef } from "react";
import { Doughnut, getElementAtEvent } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { motion } from "framer-motion";
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
// Adjust the path and action name according to your customersSlice
import { setLastFilter as setCustomerLastFilter } from '../home/customersSlice'; 

ChartJS.register(ArcElement, Tooltip, Legend);

// Define the price ranges and their corresponding API filter values for customer budgets
// Assuming 1000 in price means 1 Billion (i.e., unit is 1 Million Toman)
// These filters will apply to the customer's stated budget.
const CUSTOMER_BUDGET_RANGES = [
  { 
    key: "below_2000",      // API key from response
    label: "زیر ۲ میلیارد", 
    // Filter for customers whose budget is <= 2000 (million)
    filter: { budget__lte: 2000 } 
  },
  { 
    key: "2000_3000",       
    label: "بین ۲ و ۳ میلیارد", 
    filter: { budget__gte: 2000, budget__lte: 3000 } 
  },
  { 
    key: "3000_5000",       
    label: "بین ۳ و ۵ میلیارد", 
    filter: { budget__gte: 3000, budget__lte: 5000 } 
  },
  { 
    key: "5000_8000",       
    label: "بین ۵ و ۸ میلیارد", 
    filter: { budget__gte: 5000, budget__lte: 8000 } 
  },
  { 
    key: "higher_8000",     
    label: "بیشتر از ۸ میلیارد", 
    filter: { budget__gte: 8000 } 
  },
];

const CustomerBudgetDiversity = () => {
  const [chartConfig, setChartConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const chartRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await api.get("dashboard/customer-budget-diversity/");
        const apiData = response.data; // e.g., { "below_2000": 10, ... }

        if (!apiData) {
            console.error("CustomerBudgetDiversity: No data received from API.");
            setChartConfig(null);
            setIsLoading(false);
            return;
        }

        const labels = CUSTOMER_BUDGET_RANGES.map(range => range.label);
        const values = CUSTOMER_BUDGET_RANGES.map(range => apiData[range.key] || 0);
        const total = values.reduce((sum, val) => sum + val, 0);

        setChartConfig({
          labels: labels,
          values: values,
          ranges: CUSTOMER_BUDGET_RANGES,
          total: total,
        });

      } catch (err) {
        console.error("CustomerBudgetDiversity: Error fetching data:", err);
        setChartConfig(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChartClick = (chartJSEvent, elementsFromEvent) => {
    console.log("CustomerBudgetDiversity: --- handleChartClick Invoked ---");
    let activeElements = elementsFromEvent || [];

    if (activeElements.length === 0 && chartRef.current && chartJSEvent) {
        const nativeDomEvent = chartJSEvent.native;
        if (nativeDomEvent) {
            const elements = getElementAtEvent(chartRef.current, nativeDomEvent);
            if (elements && elements.length > 0) {
                activeElements = elements;
            }
        } else {
            console.warn("CustomerBudgetDiversity: chartJSEvent.native is undefined.");
        }
    }
    
    if (activeElements.length > 0) {
      const dataIndex = activeElements[0].index;

      if (chartConfig && chartConfig.ranges && chartConfig.ranges[dataIndex]) {
        const clickedRange = chartConfig.ranges[dataIndex];
        console.log("CustomerBudgetDiversity: Clicked Budget Range for filter:", clickedRange);

        // Determine a representative budget_input value for CustomerFilter.jsx
        let representativeBudgetInput;
        if (clickedRange.filter.budget__gte !== undefined) {
            representativeBudgetInput = clickedRange.filter.budget__gte;
        } else if (clickedRange.filter.budget__lte !== undefined) {
            representativeBudgetInput = clickedRange.filter.budget__lte;
        }

        const filterPayload = {
          status: "ACTIVE", 
          customer_type: "buy", // Assuming this chart refers to 'buy' customers' budgets
          ...clickedRange.filter, // Spreads budget__gte and/or budget__lte
          
          // For CustomerFilter.jsx 'buy' type, it expects 'budget_input'
          budget_input: representativeBudgetInput !== undefined ? representativeBudgetInput : null,
          
          // Explicitly clear rent budget fields for CustomerFilter.jsx
          up_budget_input: null,
          rent_budget_input: null,
        };
        
        for (const key in filterPayload) {
            if (filterPayload[key] === undefined) { 
                delete filterPayload[key];
            }
        }
        if (filterPayload.budget_input === 0) filterPayload.budget_input = null;


        console.log("CustomerBudgetDiversity: Dispatching filter to customersSlice:", filterPayload);
        dispatch(setCustomerLastFilter(filterPayload));
        // Ensure '/customers' is the correct route for your Customers list component
        navigate('/customers'); 
      } else {
        console.warn("CustomerBudgetDiversity: Could not get budget range filter. DataIndex:", dataIndex, "ChartConfig:", chartConfig);
      }
    } else {
      console.log("CustomerBudgetDiversity: No chart element found at click position or from event.");
    }
  };

  if (isLoading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="flex items-center justify-center h-72 sm:h-80 md:h-96"> {/* Increased height for consistency */}
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </motion.div>
    );
  }

  if (!chartConfig || chartConfig.values.reduce((a, b) => a + b, 0) === 0) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="bg-white p-4 rounded-xl shadow-md border border-gray-100 flex flex-col items-center justify-center h-72 sm:h-80 md:h-96"> {/* Increased height */}
        <motion.h3 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="text-lg font-semibold text-gray-800 mb-4 text-center">
          تنوع بودجه مشتریان
        </motion.h3>
        <p className="text-gray-500 mt-4">داده‌ای برای نمایش وجود ندارد.</p>
      </motion.div>
    );
  }

  const data = {
    labels: chartConfig.labels,
    datasets: [{
      label: 'تعداد مشتریان',
      data: chartConfig.values,
      backgroundColor: [
        'rgba(99, 102, 241, 0.8)', 'rgba(59, 130, 246, 0.8)', 'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)', 'rgba(239, 68, 68, 0.8)',
      ],
      borderColor: [
        'rgba(99, 102, 241, 1)', 'rgba(59, 130, 246, 1)', 'rgba(16, 185, 129, 1)',
        'rgba(245, 158, 11, 1)', 'rgba(239, 68, 68, 1)',
      ],
      borderWidth: 1,
      hoverOffset: 10
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    onClick: (chartJSEvent, elements) => handleChartClick(chartJSEvent, elements),
    plugins: {
      legend: {
        position: 'bottom', rtl: true,
        labels: { usePointStyle: true, padding: 20, font: { family: 'Vazir, sans-serif' }}
      },
      tooltip: {
        rtl: true, bodyFont: { family: 'Vazir, sans-serif' }, titleFont: { family: 'Vazir, sans-serif' },
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0; // Count of customers
            const totalCustomers = chartConfig.total || 0;
            const percentage = totalCustomers > 0 ? Math.round((value / totalCustomers) * 100) : 0;
            return `${label}: ${value} نفر (${percentage}%)`;
          }
        }
      }
    },
    cutout: '70%',
    animation: {
      animateScale: true, animateRotate: true, duration: 1000, easing: 'easeOutQuart'
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
      className="bg-white p-4 rounded-xl shadow-md border border-gray-100 min-h-[400px]"> {/* Increased min-height for consistency */}
      <motion.h3 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
        className="text-lg font-semibold text-gray-800 mb-4 text-center">
        تنوع بودجه مشتریان
      </motion.h3>
      
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
        className="relative h-60 sm:h-64 md:h-72 cursor-pointer"> {/* Added relative and cursor-pointer */}
        <Doughnut ref={chartRef} data={data} options={options} />
      </motion.div>
      
      {chartConfig && chartConfig.total > 0 && ( // Conditional rendering for total
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="mt-4 text-center text-sm text-gray-500">
          مجموع: {chartConfig.total.toLocaleString()} مشتری
        </motion.div>
      )}
    </motion.div>
  );
}

export default CustomerBudgetDiversity;
