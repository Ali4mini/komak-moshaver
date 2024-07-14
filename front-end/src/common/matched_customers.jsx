import { useState, Fragment, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import api from "./api";
import { Link, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  setRelatedCustomers,
  addToCustomersToNotify,
  removeFromCustomersToNotify,
} from "../file/fileSlice";

const Customer = ({ customerName, customerPhone, customerId, customerType, hasNotified }) => {
  const dispatch = useDispatch();

  const handleCheckboxChange = (e) => {
    console.log(`in handler ${customerId}`);
    if (e.target.checked) {
      dispatch(addToCustomersToNotify(customerId));
    } else {
      dispatch(removeFromCustomersToNotify(customerId));
    }
  };

  return (
    <div className="flex flex-row p-1 align-middle items-center justify-between ">

      <Link key={customerId} to={`/customer/${customerType}/${customerId}`}>
        {hasNotified ? (

          <div className="flex flex-col">
            <h3 className="text-lg text-gray-400 line-through">{customerName}</h3>
            <p className="text-sm text-gray-400 line-through">{customerPhone}</p>
          </div>
        ) : (
          <div className="flex flex-col">
            <h3 className="text-lg text-black">{customerName}</h3>
            <p className="text-sm text-gray-400">{customerPhone}</p>
          </div>
        )}
      </Link>

      <input
        type="checkbox"
        onChange={handleCheckboxChange}
        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded "
        defaultChecked={hasNotified}
      />
    </div>
  );
};

const MatchedCustomers = ({ isOpen, setIsOpen, notifiedCustomers }) => {
  const dispatch = useDispatch();
  const store = useSelector((state) => state.file);
  const customersList = store.relatedCustomers;
  const customersToNotify = store.customersToNotify;

  const location = useLocation();

  const notifyCustomers = () => {
    console.log(customersToNotify);
    api
      .patch(`${location.pathname}/`, { notified_customers: customersToNotify })
      .then((response) => {
        console.log(response.data);
        setIsOpen(false);
      })
      .catch((error) => console.log(error));
  };
  useEffect(() => {
    const apiUrl = `${location.pathname}/related_customers/`;
    api
      .get(apiUrl)
      .then((response) => {
        dispatch(setRelatedCustomers(response.data));
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  return (
    <>
      <Transition
        show={isOpen}
        enter="transition duration-100 ease-out"
        enterFrom="transform scale-95 opacity-0"
        enterTo="transform scale-100 opacity-100"
        leave="transition duration-75 ease-out"
        leaveFrom="transform scale-100 opacity-100"
        leaveTo="transform scale-95 opacity-0"
        as={Fragment}
      >
        <Dialog
          open={isOpen}
          onClose={() => setIsOpen(false)}
          size="sm"
          className="relative z-50"
        >
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

          <div className="fixed inset-0 flex items-center justigy-center">
            <Dialog.Panel className="flex flex-col gap-2 h-5/6 mx-auto  px-5 py-2 max-w-md rounded-lg bg-white">
              <Dialog.Title className="text-lg">مشتریان مرتبط</Dialog.Title>
              <div
                id="customers"
                className="flex flex-col p-2 h-full rounded-md overflow-y-scroll border gap-2"
              >
                {customersList?.map((customer) => (


                  < Customer
                    customerName={customer.customer_name}
                    customerPhone={customer.customer_phone}
                    customerId={customer.id}
                    customerType={customer.customer_type}
                    hasNotified={false}
                    key={customer.id}
                  />
                ))}
              </div>
              <div
                id="actions"
                className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between mt-4"
              >
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-3 sm:px-4 text-xs md:text-base h-10 rounded-lg bg-blue-400"
                >
                  لغو
                </button>
                <button
                  onClick={() => notifyCustomers()}
                  className="px-3 sm:px-4 text-xs md:text-base h-10 rounded-lg bg-yellow-400"
                >
                  اطلاع رسانی انجام شد
                </button>
                <button
                  className="px-3 sm:px-4 text-xs md:text-base h-10 rounded-lg bg-red-400 cursor-not-allowed opacity-50"
                >
                  اطلاع رسانی کن
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog >
      </Transition >
    </>
  );
};

export default MatchedCustomers;
