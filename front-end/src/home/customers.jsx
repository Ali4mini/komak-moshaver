import Filter from "./customer_filter";
import PkFilter from "./customer_pk_filter";
import { useEffect } from "react";
import api from "../common/api";
import Customer from "./customer_card";
import { setCustomers } from "./customersSlice";
import { useDispatch, useSelector } from "react-redux";
import ScrollButton from "../common/goUpButton";

const Customers = () => {
  const store = useSelector((state) => state.customers);
  const agentsField =
    localStorage.getItem("agents_field") === "sell" ? "buy" : "rent";
  const dispatch = useDispatch();
  useEffect(() => {
    if (store.lastFilter) {
      api
        .get(store.lastFilter)
        .then((response) => {
          dispatch(setcustomers(response.data));
        })
        .catch((error) => console.log(error));
    } else {
      api
        .get("listing/customers", {
          params: {
            status: "ACTIVE",
            customer_type: agentsField,
          },
        })
        .then((response) => {
          dispatch(setCustomers(response.data));
        })
        .catch((error) => console.log(error));
    }
  }, []);

  return (
    <div className="Customers flex flex-col gap-3">
      {/* <PkFilter /> */}
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
      <ScrollButton />
    </div>
  );
};

export default Customers;
