import { Chart as ChartJS, registerables } from "chart.js";
import CustomerPerDay from "./customerPerDay";
import FilePerDay from "./filePerDay";
import PropertyDiversity from "./propertyTypeDiversity";
import FilePriceDiversity from "./filePriceDiversity";
import CustomerBudgetDiversity from "./customerBudgetDiversity";

ChartJS.register(...registerables)

const Dashboard = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <PropertyDiversity />
      </div>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <FilePriceDiversity />
      </div>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <CustomerBudgetDiversity />
      </div>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <CustomerPerDay startDate={"2023-01-01"} />
      </div>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <FilePerDay startDate={"2023-01-01"} />
      </div>
    </div>
  );
};

export default Dashboard;
