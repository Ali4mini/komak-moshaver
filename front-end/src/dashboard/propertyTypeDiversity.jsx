// File: PropertyDiversity.jsx
import { api } from "../common/api";
import { useState, useEffect, useRef } from "react";
import { Doughnut, getElementAtEvent } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setLastFilter as setFilesLastFilter } from '../home/filesSlice'; // Ensure this path is correct

ChartJS.register(ArcElement, Tooltip, Legend);

// No longer need translatePropertyTypeForDisplay if API provides the display label

const PropertyDiversity = () => {
  const [chartData, setChartData] = useState(null);
  const [fileType, setFileType] = useState(localStorage.getItem("agents_field") || "sell");
  const [isLoading, setIsLoading] = useState(true);

  const chartRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await api.get("dashboard/property-type-diversity/");
        let rawApiData = response.data[fileType];

        if (!Array.isArray(rawApiData) && Array.isArray(response.data)) {
            rawApiData = response.data;
        }

        if (!Array.isArray(rawApiData)) {
          console.error("PropertyDiversity: Data for fileType '" + fileType + "' is not an array:", rawApiData);
          setChartData(null); setIsLoading(false); return;
        }
        if (rawApiData.length === 0) {
            setChartData(null); setIsLoading(false); return;
        }
        
        // Ensure item.key, item.type (display label), and item.count exist
        const validApiData = rawApiData.filter(item => 
            typeof item.key !== 'undefined' &&
            typeof item.type !== 'undefined' && 
            typeof item.count !== 'undefined'
        );
        console.log("PropertyDiversity: Valid API data items:", validApiData);

        // Labels for the chart will be human-readable names from API (item.type)
        const labels = validApiData.map(item => item.type); 
        const values = validApiData.map(item => item.count); // Using raw counts
        const total = values.reduce((sum, value) => sum + value, 0);

        setChartData({
          labels: labels,       // Display labels (e.g., 'آپارتمان')
          values: values,       // Counts
          apiTypeKeys: validApiData.map(item => item.key), // Short codes for filtering (e.g., 'A')
          total: total
        });
      } catch (err) {
        console.error("PropertyDiversity: Error fetching chart data:", err); setChartData(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [fileType]);

  const handleChartClick = (chartJSEvent, elementsFromEvent /*, chartInstanceFromEvent */) => {
    console.log("PropertyDiversity: --- handleChartClick Invoked ---");
    let activeElements = elementsFromEvent || [];

    if (activeElements.length === 0 && chartRef.current && chartJSEvent) {
        const nativeDomEvent = chartJSEvent.native;
        if (nativeDomEvent) {
            const elements = getElementAtEvent(chartRef.current, nativeDomEvent);
            if (elements && elements.length > 0) {
                activeElements = elements;
            }
        } else {
            console.warn("PropertyDiversity: chartJSEvent.native is undefined.");
        }
    }
    
    console.log("PropertyDiversity: Active elements:", activeElements);

    if (activeElements.length > 0) {
      const dataIndex = activeElements[0].index;

      if (chartData && chartData.apiTypeKeys && typeof chartData.apiTypeKeys[dataIndex] !== 'undefined') {
        const clickedApiKey = chartData.apiTypeKeys[dataIndex]; // This is 'A', 'L', 'S', 'H'
        console.log("PropertyDiversity: Clicked API Key for filter:", clickedApiKey);

        const filterPayload = {
          status: "ACTIVE", 
          file_type: fileType, 
          property_type: clickedApiKey, // Using the API key (short code)
        };
        
        Object.keys(filterPayload).forEach(key => {
          if (filterPayload[key] === null || filterPayload[key] === undefined) {
              delete filterPayload[key];
          }
        });

        console.log("PropertyDiversity: Dispatching filter:", filterPayload);
        dispatch(setFilesLastFilter(filterPayload));
        navigate('/');
      } else {
        console.warn("PropertyDiversity: Could not get API key. DataIndex:", dataIndex, "ChartData:", chartData);
      }
    } else {
      console.log("PropertyDiversity: No chart element found at click position or from event.");
    }
  };

  // ... (isLoading, no data, chart data/options, and return JSX remain the same)
  // Ensure that options.plugins.tooltip.callbacks.label uses context.label (which is item.type from API)
  // and context.raw (which is item.count from API)
  // Example for tooltip in options:
  // plugins: {
  //   tooltip: {
  //     callbacks: {
  //       label: function(context) {
  //         if (!chartData || !chartData.total) return '';
  //         const totalCount = chartData.total;
  //         const currentValue = context.raw; // This is the count for the segment
  //         const currentLabel = context.label; // This is the human-readable type
  //         const percentage = totalCount > 0 ? Math.round((currentValue / totalCount) * 100) : 0;
  //         return `${currentLabel}: ${percentage}% (${currentValue} مورد)`;
  //       }
  //     }
  //     // ... other tooltip options
  //   }
  //   // ... other plugins
  // }


  if (isLoading) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center justify-center h-72 sm:h-80 md:h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!chartData || chartData.values.length === 0) { 
    return (
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col items-center justify-center h-72 sm:h-80 md:h-96">
        <div className="flex justify-between items-center mb-3 w-full px-2">
            <h3 className="text-md font-medium text-gray-800">
            توزیع نوع ملک ({fileType === "sell" ? "فروش" : "اجاره"})
            </h3>
            <select 
            value={fileType}
            onChange={(e) => setFileType(e.target.value)}
            className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
            <option value="sell">فروش</option>
            <option value="rent">اجاره</option>
            </select>
        </div>
        <p className="text-gray-500 mt-4">داده‌ای برای نمایش وجود ندارد.</p>
      </div>
    );
  }

  const data = { 
    labels: chartData.labels, // These are now the human-readable types from API (e.g., 'آپارتمان')
    datasets: [{
      label: 'نسبت انواع ملک',
      data: chartData.values, // These are the counts
      backgroundColor: [
        'rgba(99, 102, 241, 0.8)', 'rgba(59, 130, 246, 0.8)', 'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)', 'rgba(239, 68, 68, 0.8)', 'rgba(139, 92, 246, 0.8)',
        'rgba(236, 72, 153, 0.8)',
      ],
      borderColor: [
        'rgba(99, 102, 241, 1)', 'rgba(59, 130, 246, 1)', 'rgba(16, 185, 129, 1)',
        'rgba(245, 158, 11, 1)', 'rgba(239, 68, 68, 1)', 'rgba(139, 92, 246, 1)',
        'rgba(236, 72, 153, 1)',
      ],
      borderWidth: 1,
      hoverOffset: 8,
    }]
  };

  const options = { 
    responsive: true,
    maintainAspectRatio: false,
    onClick: (chartJSEvent, elements) => handleChartClick(chartJSEvent, elements), // Chart.js passes elements as 2nd arg
    plugins: {
      legend: {
        position: 'bottom', rtl: true,
        labels: { usePointStyle: true, padding: 20, font: { family: 'Vazir, sans-serif' }}
      },
      tooltip: {
        rtl: true,
        bodyFont: { family: 'Vazir, sans-serif' }, titleFont: { family: 'Vazir, sans-serif' },
        callbacks: {
          label: function(context) {
            // context.label is the human-readable type (e.g., 'آپارتمان')
            // context.raw is the count for this segment
            if (!chartData || chartData.total === undefined || chartData.total === 0) {
                 return `${context.label}: ${context.raw} مورد`; // Show count if total is 0 or undefined
            }
            const totalCount = chartData.total;
            const currentValue = context.raw; 
            const percentage = Math.round((currentValue / totalCount) * 100);
            return `${context.label}: ${percentage}% (${currentValue} مورد)`;
          }
        }
      }
    },
    cutout: '60%', 
    animation: { animateScale: true, animateRotate: true }
  };

  return ( 
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 min-h-[350px]">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-md font-medium text-gray-800">
          توزیع نوع ملک ({fileType === "sell" ? "فروش" : "اجاره"})
        </h3>
        <select 
          value={fileType}
          onChange={(e) => setFileType(e.target.value)}
          className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="sell">فروش</option>
          <option value="rent">اجاره</option>
        </select>
      </div>
      
      <div className="relative h-60 sm:h-64 md:h-72 cursor-pointer">
        <Doughnut ref={chartRef} data={data} options={options} />
      </div>
    </div>
  );
}

export default PropertyDiversity;
