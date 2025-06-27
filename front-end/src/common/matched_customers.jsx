import { useState, Fragment, useEffect, useCallback } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { api } from "./api";
import { Link, useLocation, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  setRelatedCustomers,
  addToCustomersToNotify,
  removeFromCustomersToNotify,
} from "../file/fileSlice";

const getAuthToken = () => localStorage.getItem('access_token');

const Customer = ({ customerName, customerPhone, customerId, hasNotified }) => {
  const dispatch = useDispatch();
  const { fileType, fileId } = useParams();
  let customerType = fileType === "sell" ? "buy": "rent" 


  const handleCheckboxChange = (e) => {
    if (e.target.checked) {
      dispatch(addToCustomersToNotify(customerId));
    } else {
      dispatch(removeFromCustomersToNotify(customerId));
    }
  };

  return (
    <div className={`flex items-center justify-between p-3 rounded-lg transition-colors ${hasNotified ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'}`}>
      <Link 
        to={`/persons/${customerId}`}
        className="flex-1 min-w-0"
      >
        <div className="flex flex-col">
          <h3 className={`text-sm font-medium truncate ${hasNotified ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
            {customerName}
          </h3>
          <p className={`text-xs truncate ${hasNotified ? 'text-gray-300' : 'text-gray-500'}`}>
            {customerPhone}
          </p>
        </div>
      </Link>

      <label className="inline-flex items-center ml-3 cursor-pointer">
        <input
          type="checkbox"
          onChange={handleCheckboxChange}
          className={`w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${hasNotified ? 'opacity-70' : ''}`}
          defaultChecked={hasNotified}
        />
      </label>
    </div>
  );
};

const MatchedCustomers = ({ isOpen, setIsOpen, notifiedCustomers }) => {
  const dispatch = useDispatch();
  const store = useSelector((state) => state.file);
  const customersList = store.relatedCustomers || [];
  const customersToNotify = store.customersToNotify || [];
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [customersData, setCustomersData] = useState([]);

  const location = useLocation();

  const fetchCustomerDetails = useCallback(async (customers) => {
    setIsLoading(true);
    setError(null);
    const token = getAuthToken();
    
    if (!token) {
      setError("نیاز به احراز هویت");
      setIsLoading(false);
      return;
    }

    try {
      const headers = { Authorization: `Bearer ${token}` };
      
      // Fetch all person data in parallel
      const personResponses = await Promise.all(
        customers.map(customer => 
          api.get(`common/persons/${customer.customer}`, { headers }).catch(err => null)
        )
      );

      // Filter out null responses and extract data
      const validResponses = personResponses
        .filter(response => response && response.data)
        .map(response => response.data);

      setCustomersData(validResponses);
      
    } catch (err) {
      setError("خطا در دریافت اطلاعات");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      const apiUrl = `${location.pathname}/related_customers/`;
      api.get(apiUrl)
        .then((response) => {
          dispatch(setRelatedCustomers(response.data));
          fetchCustomerDetails(response.data);
        })
        .catch((error) => {
          console.error(error);
          setError("خطا در دریافت مشتریان مرتبط");
        });
    }
  }, [isOpen, location.pathname, dispatch, fetchCustomerDetails]);

  const notifyCustomers = () => {
    setIsLoading(true);
    api.patch(`${location.pathname}/`, { notified_customers: customersToNotify })
      .then((response) => {
        setIsOpen(false);
      })
      .catch((error) => {
        console.error(error);
        setError("خطا در ثبت اطلاع رسانی");
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={() => setIsOpen(false)} className="relative z-50">
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        </Transition.Child>

        {/* Modal container */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all">
              {/* Modal header */}
              <div className="px-6 pt-6 pb-2 border-b border-gray-100">
                <Dialog.Title className="text-lg font-semibold text-gray-900">
                  مشتریان مرتبط
                </Dialog.Title>
                <p className="mt-1 text-sm text-gray-500">
                  {customersList.length} مشتری پیدا شد
                </p>
              </div>

              {/* Customers list */}
              <div className="px-4 py-3 max-h-[60vh] overflow-y-auto">
                {isLoading ? (
                  <div className="py-8 text-center">
                    <p className="text-gray-500">در حال بارگیری...</p>
                  </div>
                ) : error ? (
                  <div className="py-8 text-center">
                    <p className="text-red-500">{error}</p>
                  </div>
                ) : customersData.length > 0 ? (
                  <div className="divide-y divide-gray-100 rounded-lg border border-gray-100 overflow-hidden">
                    {customersData.map((customer) => (
                      <Customer
                        key={customer.id}
                        customerName={customer.last_name}
                        customerPhone={customer.phone_number}
                        customerId={customer.id}
                        customerType={customer.type}
                        hasNotified={notifiedCustomers?.includes(customer.id) || false}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-gray-500">مشتری مرتبطی یافت نشد</p>
                  </div>
                )}
              </div>

              {/* Modal footer */}
              <div className="px-6 py-4 bg-gray-50 flex flex-col sm:flex-row-reverse sm:justify-start gap-3">
                <button
                  onClick={notifyCustomers}
                  disabled={isLoading || customersToNotify.length === 0}
                  className={`inline-flex justify-center rounded-md px-4 py-2 text-sm font-medium text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                    isLoading || customersToNotify.length === 0 
                      ? 'bg-blue-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isLoading ? 'در حال پردازش...' : 'اطلاع رسانی انجام شد'}
                </button>
                <button
                  disabled
                  className="inline-flex justify-center rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 cursor-not-allowed opacity-70"
                >
                  اطلاع رسانی کن
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  disabled={isLoading}
                  className="inline-flex justify-center rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2 border border-gray-300"
                >
                  لغو
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};

export default MatchedCustomers;
