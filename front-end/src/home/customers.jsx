import Filter from "./customer_filter";
import PkFilter from "./customer_pk_filter";
import { useEffect } from "react";
import api from "../common/api";
import Customer from "./customer_card";
import { setCustomers } from "./customersSlice";
import { useDispatch, useSelector } from "react-redux";

const Customers = () => {
  const store = useSelector((state) => state.customers);
  const dispatch = useDispatch();
  useEffect(() => {
    api.get("listing/customers/").then((response) => {
      dispatch(setCustomers(response.data));
    });
  }, []);

  return (
    <div className="Customers flex flex-col gap-3">
      <PkFilter />
      <Filter />
      <div className="flex flex-col ">
        {store.customers ? (
          store.customers.map((item, index) => (
            <Customer key={index} customer={item} />
          ))
        ) : (
          <p>no customer was found</p>
        )}
      </div>
    </div>
  );
};

export default Customers;
