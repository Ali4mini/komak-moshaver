import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import api from "../common/api";
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const FilePerDay = () => {
  const [tempData, setTempData] = useState(null);
  const [timeFrame, setTimeFrame] = useState("daily");
  const [selectedDate, setSelectedDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));

  useEffect(() => {
    api
      .get("dashboard/file-per-day/", { params: { "start_date": selectedDate.toISOString().split('T')[0] } }) // Convert date to ISO string format
      .then((response) => {
        let uncleaned_data = response.data;
        let labels = [];
        let sellValues = [];
        let rentValues = [];

        uncleaned_data.sell[timeFrame].map((day) => {
          labels.push(day.date);
        });

        uncleaned_data.sell[timeFrame].map((day) => {
          sellValues.push(day.count);
        });
        uncleaned_data.rent[timeFrame].map((day) => {
          rentValues.push(day.count);
        });
        setTempData({ labels: labels, sellValues: sellValues, rentValues: rentValues });
      })
      .catch(error => console.log(error));
  }, [selectedDate, timeFrame]);

  if (tempData) {
    const data = {
      labels: tempData.labels,
      datasets: [
        {
          label: 'Sell Files',
          data: tempData.sellValues,
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        },
        {
          label: 'Rent Files',
          data: tempData.rentValues,
          backgroundColor: 'rgba(255, 99, 132, 0.2)', // Different color for the second dataset
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1
        }
      ]
    };

    const options = {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    };

    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <DatePicker
          selected={selectedDate}
          onChange={(date) => setSelectedDate(date)}
          dateFormat="yyyy-MM-dd"
          className="border-2 border-gray-300 rounded-md px-3 py-2"

        />
        <select onChange={(e) => setTimeFrame(e.target.value)}>
          <option value="daily">Daily</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>

        <Bar data={data} options={options} />
      </div>
    );
  }

  return null; // Return null or a loading indicator if tempData is not yet available
};

export default FilePerDay;
