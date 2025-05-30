import { useEffect, useState, useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from "react-chartjs-2";
import { api } from "../common/api"; // Assuming this is your configured Axios instance or similar
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css"; // Keep this for base DatePicker styles

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Helper components for UI states
const LoadingSpinner = () => (
  <div className="flex justify-center items-center p-10">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    <p className="ml-3 text-slate-600">Loading data...</p>
  </div>
);

const ErrorMessage = ({ message }) => (
  <div className="text-center p-10 text-red-600 bg-red-100 border border-red-400 rounded-md">
    <p><strong>Oops! Something went wrong.</strong></p>
    <p>{message}</p>
  </div>
);

const NoDataMessage = () => (
    <div className="text-center p-10 text-slate-500">
        <p>No data available for the selected period.</p>
    </div>
);


const FilePerDay = () => {
  const [chartRawData, setChartRawData] = useState(null);
  const [timeFrame, setTimeFrame] = useState("daily");
  const [selectedDate, setSelectedDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    setChartRawData(null); // Clear previous data

    api
      .get("dashboard/file-per-day/", {
        params: { "start_date": selectedDate.toISOString().split('T')[0] }
      })
      .then((response) => {
        const uncleanedData = response.data;
        if (!uncleanedData || (!uncleanedData.sell && !uncleanedData.rent)) {
            setChartRawData({ labels: [], sellValues: [], rentValues: [] }); // Set empty data if API returns nothing useful
            setIsLoading(false);
            return;
        }

        const sellData = uncleanedData.sell?.[timeFrame] || [];
        const rentData = uncleanedData.rent?.[timeFrame] || [];

        // Robustly combine labels and data
        const allDatesSet = new Set();
        sellData.forEach(item => allDatesSet.add(item.date));
        rentData.forEach(item => allDatesSet.add(item.date));

        // Sort dates (assuming 'YYYY-MM-DD' or similar sortable format)
        const sortedLabels = Array.from(allDatesSet).sort();

        const sellMap = new Map(sellData.map(item => [item.date, item.count]));
        const rentMap = new Map(rentData.map(item => [item.date, item.count]));

        const sellValues = sortedLabels.map(date => sellMap.get(date) || 0);
        const rentValues = sortedLabels.map(date => rentMap.get(date) || 0);
        
        setChartRawData({ labels: sortedLabels, sellValues, rentValues });
        setIsLoading(false);
      })
      .catch(err => {
        console.error("API Error:", err);
        setError(err.message || "Failed to fetch data. Please try again.");
        setIsLoading(false);
      });
  }, [selectedDate, timeFrame]);

  const chartData = useMemo(() => {
    if (!chartRawData) return { labels: [], datasets: [] };

    return {
      labels: chartRawData.labels,
      datasets: [
        {
          label: 'Sell Files',
          data: chartRawData.sellValues,
          backgroundColor: 'rgba(54, 162, 235, 0.6)', // Modern Blue
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
          borderRadius: 4, // Rounded bars
        },
        {
          label: 'Rent Files',
          data: chartRawData.rentValues,
          backgroundColor: 'rgba(75, 192, 192, 0.6)', // Modern Teal
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
          borderRadius: 4, // Rounded bars
        }
      ]
    };
  }, [chartRawData]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false, // Allows chart to fill container height
    plugins: {
      legend: {
        position: 'top',
        labels: {
          padding: 20,
          font: {
            size: 14,
          }
        }
      },
      title: {
        display: true,
        text: `File Activity - ${timeFrame.charAt(0).toUpperCase() + timeFrame.slice(1)} View`,
        font: {
          size: 18,
          weight: 'bold',
        },
        padding: {
          top: 10,
          bottom: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.7)',
        titleFont: { size: 14 },
        bodyFont: { size: 12 },
        padding: 10,
        cornerRadius: 4,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(200, 200, 200, 0.2)', // Lighter grid lines
        },
        ticks: {
          color: '#6B7280', // Tailwind gray-500
        }
      },
      x: {
        grid: {
          display: false, // Cleaner look without vertical grid lines
        },
        ticks: {
          color: '#6B7280',
        }
      }
    }
  }), [timeFrame]);


  return (
    <div className="min-h-screen bg-slate-100 p-4 flex justify-center items-start">
      <div className="bg-white p-6 md:p-8 rounded-xl shadow-2xl w-full max-w-4xl my-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-6 text-center">
          File Activity Overview
        </h1>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 sm:gap-6 px-2">
          <div className="w-full sm:w-auto">
            <label htmlFor="date-picker" className="block text-sm font-medium text-slate-700 mb-1">Select Start Date:</label>
            <DatePicker
              id="date-picker"
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              dateFormat="MMMM d, yyyy"
              className="p-2.5 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full text-sm transition duration-150"
              wrapperClassName="w-full"
            />
          </div>
          
          <div className="w-full sm:w-auto">
            <label htmlFor="timeframe-select" className="block text-sm font-medium text-slate-700 mb-1">Time Frame:</label>
            <select
              id="timeframe-select"
              value={timeFrame}
              onChange={(e) => setTimeFrame(e.target.value)}
              className="p-2.5 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full text-sm transition duration-150 bg-white"
            >
              <option value="daily">Daily</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        </div>

        {/* Chart Area */}
        <div className="h-96 bg-slate-50 p-2 sm:p-4 rounded-lg shadow-inner relative">
          {isLoading && <LoadingSpinner />}
          {error && !isLoading && <ErrorMessage message={error} />}
          {!isLoading && !error && chartRawData && chartRawData.labels.length > 0 && (
            <Bar data={chartData} options={chartOptions} />
          )}
          {!isLoading && !error && chartRawData && chartRawData.labels.length === 0 && (
            <NoDataMessage />
          )}
        </div>
      </div>
    </div>
  );
};

export default FilePerDay;
