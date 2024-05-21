import Filter from "./customer_filter";
import PkFilter from "./customer_pk_filter";
import { useEffect, useState } from "react";
import api from "../common/api";
import Customer from "./customer_card";
import { addCustomers } from "./customersSlice";
import { useDispatch, useSelector } from "react-redux";
import ScrollButton from "../common/goUpButton";

const Customers = () => {
  const store = useSelector((state) => state.customers);
  const agentsField = localStorage.getItem("agents_field") === "sell" ? "buy" : "rent";
  const dispatch = useDispatch();
  const [pageNumber, setPageNumber] = useState(1);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  // Initial fetch
  useEffect(() => {
    if (store.lastFilter) {
      getCustomers(store.lastFilter)

    }
    else {

      getCustomers();
    }
    console.log("Initial fetch triggered");
  }, [pageNumber]);

  const getCustomers = (filter = { status: "ACTIVE", customer_type: agentsField }) => {
    api.get(`/listing/customers/?page=${pageNumber}`, { params: filter })
      .then((response) => {

        dispatch(addCustomers(response.data.results));

        setIsFetchingMore(false)
      })
      .catch((error) => console.error(error));
  };

  // Fetch more on scroll
  useEffect(() => {

    const handleScroll = () => {
      const scrolledTo = window.scrollY + window.innerHeight;
      const isReachedBottom = document.body.scrollHeight === scrolledTo;

      if (isReachedBottom) {
        console.log("User has reached the bottom of the page.");
        setIsFetchingMore(true)
        setPageNumber(prevPageNumber => prevPageNumber + 1)

      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isFetchingMore]); // Correctly include isFetchingMore in the dependency array

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
