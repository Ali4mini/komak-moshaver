import { api } from "../common/api";
import { useState, useEffect } from "react";
import { Doughnut } from 'react-chartjs-2';

const CustomerBudgetDiversity = () => {
  const [tempData, setTempData] = useState(null);
  const [fileType, setFileType] = useState("sell");

  useEffect(() => {
    api.get("dashboard/customer-budget-diversity/").then(response => {

      let uncleaned_data = response.data;
      let labels = [
        "زیر ۲ میلیارد",
        "بین ۲ و ۳ میلیارد",
        "بین ۳ و ۵ میلیارد",
        "بین ۵ و ۸ میلیارد",
        "بیشتر از ۸ میلیارد",
      ];
      let values = [
        uncleaned_data["below_2000"],
        uncleaned_data["2000_3000"],
        uncleaned_data["3000_5000"],
        uncleaned_data["5000_8000"],
        uncleaned_data["higher_8000"]
      ];
      setTempData({ labels: labels, values: values });
    }, []);
  }, []);

  // Moved the rendering logic outside of useEffect
  if (tempData) {
    const data = {
      labels: tempData.labels,
      datasets: [{
        label: 'درصد فایل ها',
        data: tempData.values,
        backgroundColor: [
          'rgb(255, 99, 132)',
          'rgb(54, 162, 235)',
          'rgb(255, 205, 86)',
          'rgb(154, 62, 35)',
          'rgb(100, 162, 35)',
        ],
        hoverOffset: 4
      }]
    };

    return (
      <div className="flex justify-center items-center h-screen">

        {/* <select onChange={(e) => setFileType(e.target.value)}> */}
        {/*   <option value="sell">sell</option> */}
        {/*   <option value="rent">rent</option> */}
        {/* </select> */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <Doughnut data={data} />
        </div>
      </div>
    );
  }

  // Render something else or return null if tempData is not yet available
  return null; // Or return a loading indicator, etc.
}

export default CustomerBudgetDiversity;
