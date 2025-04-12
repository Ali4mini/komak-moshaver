import { api } from "../common/api";
import { useState, useEffect } from "react";
import { Doughnut } from 'react-chartjs-2';

const PropertyDiversity = () => {
  const [tempData, setTempData] = useState(null);
  const [fileType, setFileType] = useState("sell");

  useEffect(() => {
    api.get("dashboard/property-type-diversity/").then(response => {
      let uncleaned_data = response.data;
      let labels = [];
      let values = [];
      uncleaned_data[fileType].map((type) => {
        labels.push(type.type);
        values.push(type.percentage);
      });
      setTempData({ labels: labels, values: values });
    }, [fileType]);
  }, [fileType]);

  // Moved the rendering logic outside of useEffect
  if (tempData) {
    const data = {
      labels: tempData.labels,
      datasets: [{
        label: 'Property Diversity',
        data: tempData.values,
        backgroundColor: [
          'rgb(255, 99, 132)',
          'rgb(54, 162, 235)',
          'rgb(255, 205, 86)'
        ],
        hoverOffset: 4
      }]
    };

    return (
      <div className="flex justify-center items-center h-screen">

        <select onChange={(e) => setFileType(e.target.value)}>
          <option value="sell">sell</option>
          <option value="rent">rent</option>
        </select>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <Doughnut data={data} />
        </div>
      </div>
    );
  }

  // Render something else or return null if tempData is not yet available
  return null; // Or return a loading indicator, etc.
}

export default PropertyDiversity;
