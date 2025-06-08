// File: FilePriceDiversity.jsx
import { api } from "../common/api";
import { useState, useEffect, useRef } from "react";
import { Doughnut, getElementAtEvent } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setLastFilter as setFilesLastFilter } from '../home/filesSlice'; // Corrected path

ChartJS.register(ArcElement, Tooltip, Legend);

// Define the price ranges and their corresponding API filter values (in millions, assuming API expects full numbers)
// Note: The keys here ('below_2000', '2000_3000', etc.) must match what your API returns.
// The `label` is for the chart. `gte` and `lte` are for the filter payload.
const PRICE_RANGES = [
  { 
    key: "below_2000", 
    label: "زیر ۲ میلیارد", 
    filter: { price__lte: 2000 } 
  },
  { 
    key: "2000_3000",   
    label: "بین ۲ و ۳ میلیارد", 
    filter: { price__gte: 2000, price__lte: 3000 } 
  },
  { 
    key: "3000_5000",   
    label: "بین ۳ و ۵ میلیارد", 
    filter: { price__gte: 3000, price__lte: 5000} 
  },
  { 
    key: "5000_8000",   
    label: "بین ۵ و ۸ میلیارد", 
    filter: { price__gte: 5000, price__lte: 8000 } 
  },
  { 
    key: "higher_8000", 
    label: "بیشتر از ۸ میلیارد", 
    filter: { price__gte: 8000 } 
  },
];

const FilePriceDiversity = () => {
  const [chartConfig, setChartConfig] = useState(null); // Renamed from chartData for clarity
  const [isLoading, setIsLoading] = useState(true);

  const chartRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await api.get("dashboard/file-price-diversity/");
        const apiData = response.data; // e.g., { "below_2000": 10, ... }

        if (!apiData) {
            console.error("FilePriceDiversity: No data received from API.");
            setChartConfig(null);
            setIsLoading(false);
            return;
        }

        const labels = PRICE_RANGES.map(range => range.label);
        const values = PRICE_RANGES.map(range => apiData[range.key] || 0); // Get count for each range key from API data

        setChartConfig({
          labels: labels,
          values: values,
          // Store the full range objects to easily access filter values on click
          ranges: PRICE_RANGES 
        });

      } catch (err) {
        console.error("FilePriceDiversity: Error fetching data:", err);
        setChartConfig(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChartClick = (chartJSEvent, elementsFromEvent) => {
    console.log("FilePriceDiversity: --- handleChartClick Invoked ---");
    let activeElements = elementsFromEvent || [];

    if (activeElements.length === 0 && chartRef.current && chartJSEvent) {
        const nativeDomEvent = chartJSEvent.native;
        if (nativeDomEvent) {
            const elements = getElementAtEvent(chartRef.current, nativeDomEvent);
            if (elements && elements.length > 0) {
                activeElements = elements;
            }
        } else {
            console.warn("FilePriceDiversity: chartJSEvent.native is undefined.");
        }
    }
    
    console.log("FilePriceDiversity: Active elements:", activeElements);

    if (activeElements.length > 0) {
      const dataIndex = activeElements[0].index;

      if (chartConfig && chartConfig.ranges && chartConfig.ranges[dataIndex]) {
        const clickedRange = chartConfig.ranges[dataIndex];
        console.log("FilePriceDiversity: Clicked Price Range for filter:", clickedRange);

        // This chart is for "فروش", so file_type is 'sell'
        // The price filter in Filter.jsx for 'sell' uses 'price' (for user input)
        // and calculates gte/lte. Here, we directly provide gte/lte.
        // The Filter.jsx component, when it loads `lastFilterFromStore`,
        // should ideally recognize `price__gte` and `price__lte` and populate itself accordingly,
        // or you might want to also pass a representative `price` value if Filter.jsx needs it
        // for its own input field when type is 'sell'.
        // For simplicity, we'll directly set gte/lte. Filter.jsx might need adjustment
        // if it strictly expects a single 'price' value from lastFilter for 'sell' type.
        const filterPayload = {
          status: "ACTIVE", 
          file_type: "sell", // Hardcoded as this chart is for "فروش"
          ...clickedRange.filter // Spread the { price__gte, price__lte } object
          // To make Filter.jsx's 'price' input field populate, you could add:
          // price: clickedRange.filter.price__gte || (clickedRange.filter.price__lte / 2) || null, // A representative value
        };
        
        Object.keys(filterPayload).forEach(key => {
          if (filterPayload[key] === null || filterPayload[key] === undefined) {
              delete filterPayload[key];
          }
        });

        console.log("FilePriceDiversity: Dispatching filter:", filterPayload);
        dispatch(setFilesLastFilter(filterPayload));
        navigate('/'); // Navigate to Files component route
      } else {
        console.warn("FilePriceDiversity: Could not get price range filter. DataIndex:", dataIndex, "ChartConfig:", chartConfig);
      }
    } else {
      console.log("FilePriceDiversity: No chart element found at click position or from event.");
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center justify-center h-72 sm:h-80 md:h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!chartConfig || chartConfig.values.reduce((a, b) => a + b, 0) === 0) { // Check if all values are zero
    return (
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col items-center justify-center h-72 sm:h-80 md:h-96">
        <h4 className="text-md font-medium text-gray-800 mb-3 text-center">
          توزیع قیمت فایل‌ های فروش
        </h4>
        <p className="text-gray-500 mt-4">داده‌ای برای نمایش وجود ندارد.</p>
      </div>
    );
  }

  const data = {
    labels: chartConfig.labels,
    datasets: [{
      label: 'تعداد فایل ها',
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
            return `${context.label}: ${context.raw} فایل`; // context.raw is the count
          }
        }
      }
    },
    cutout: '70%',
    animation: { animateScale: true, animateRotate: true }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 min-h-[350px]">
      <h4 className="text-md font-medium text-gray-800 mb-3 text-center">
        توزیع قیمت فایل‌ های فروش
      </h4>
      <div className="relative h-60 sm:h-64 md:h-72 cursor-pointer">
        <Doughnut ref={chartRef} data={data} options={options} />
      </div>
    </div>
  );
}

export default FilePriceDiversity;
