import { Chart as ChartJS, registerables } from "chart.js";
import CustomerPerDay from "./customerPerDay";
import FilePerDay from "./filePerDay";
import PropertyDiversity from "./propertyTypeDiversity";

ChartJS.register(...registerables)


const Dashboard = () => {
  return (

    <div className="grid grid-cols-2 gap-4 h-1/2">


      <PropertyDiversity />
      <CustomerPerDay startDate={"2023-01-01"} />

      <FilePerDay startDate={"2023-01-01"} />

    </div>


  )
}
export default Dashboard
