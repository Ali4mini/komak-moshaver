import Filter from "./customer_filter";
import PkFilter from "./customer_pk_filter";
import { useEffect, useState } from "react";
import api from "../common/api";
import Customer from "./customer_card";

const Customers = () => {
  const [customers, setCustomers] = useState(null);

  useEffect(() => {
    api.get("customers/").then((response) => {
      setCustomers(response.data);
    });
  }, []);

  return (
    <div className="Customers flex flex-col gap-3">
      <PkFilter setter={setCustomers} />
      <Filter setter={setCustomers} />
      <div className="flex flex-col ">
        {customers ? (
          customers.map((item, index) => <Customer key={index} customer={item} />)
        ) : (
          <p>no customer was found</p>
        )}
      </div>
    </div>

  );
};

export default Customers;
