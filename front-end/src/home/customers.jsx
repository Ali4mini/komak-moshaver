import CustomerCard from "./customer_card";
import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { api } from "../common/api";
import { addCustomers, setCustomers } from "./customersSlice";
import { useSelector, useDispatch } from "react-redux";
import ScrollButton from "../common/goUpButton";
import CustomerFilter from "./customer_filter";
import BeatLoader from "react-spinners/BeatLoader";
import { FiUsers, FiFilter, FiX } from "react-icons/fi";

const Customers = () => {
  const { customers, lastFilter } = useSelector((state) => state.customers);
  const dispatch = useDispatch();
  const [pageNumber, setPageNumber] = useState(1);
  const [isFetching, setIsFetching] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const observer = useRef();

  // Memoize default filter to prevent unnecessary changes
  const defaultFilter = useMemo(() => ({
    status: "ACTIVE",
    customer_type: localStorage.getItem("agents_field") === "sell" ? "buy" : "rent"
  }), []);

  // Stable getCustomers function
  const getCustomers = useCallback(async (page, isNewFilter = false) => {
    if (isFetching) return;
    
    setIsFetching(true);
    if (isNewFilter) setInitialLoad(true);

    try {
      const filterParams = lastFilter || defaultFilter;
      const response = await api.get(`/listing/customers/?page=${page}`, { 
        params: filterParams 
      });
      
      const validResults = response.data.results.filter(
        item => item?.id && typeof item === 'object'
      );

      if (validResults.length !== response.data.results.length) {
        console.warn("API returned some invalid customer items:", response.data.results);
      }

      dispatch(isNewFilter ? 
        setCustomers(validResults) : 
        addCustomers(validResults)
      );
      
      setHasMore(response.data.next !== null);
      if (isNewFilter) {
        setPageNumber(1);
      } else {
        setPageNumber(prev => prev + 1);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
      setHasMore(false);
    } finally {
      setIsFetching(false);
      setInitialLoad(false);
    }
  }, [dispatch, isFetching, lastFilter, defaultFilter]);

  // Initial load and filter change effect
  useEffect(() => {
    setHasMore(true);
    getCustomers(1, true);
  }, [lastFilter]); // Only watch lastFilter

  // Cleanup observer on unmount
  useEffect(() => {
    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, []);

  // Stable intersection observer callback
  const lastCustomerElementRef = useCallback((node) => {
    if (isFetching || initialLoad || !hasMore) {
      if (observer.current) observer.current.disconnect();
      return;
    }

    observer.current = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          getCustomers(pageNumber);
        }
      },
      { threshold: 0.1 }
    );

    if (node) observer.current.observe(node);
  }, [isFetching, hasMore, pageNumber, getCustomers, initialLoad]);

  // Memoize customer cards to prevent unnecessary re-renders
  const customerCards = useMemo(() => {
    return customers.map((customer, index) => {
      if (!customer?.id) return null;
      return customers.length === index + 1 ? (
        <div ref={lastCustomerElementRef} key={customer.id}>
          <CustomerCard customer={customer} />
        </div>
      ) : (
        <CustomerCard key={customer.id} customer={customer} />
      );
    });
  }, [customers, lastCustomerElementRef]);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header remains the same */}
      <header className="bg-white shadow-md sticky top-0 z-50">
       <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <FiUsers className="h-7 w-7 text-teal-600 mr-2 rtl:mr-0 rtl:ml-2" />
            <h1 className="text-xl sm:text-2xl font-semibold text-teal-700">لیست مشتریان</h1>
          </div>
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="p-2 rounded-md text-teal-600 hover:bg-teal-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
            aria-expanded={isFilterOpen}
            aria-controls="customer-filter-panel"
          >
            {isFilterOpen ? (
              <FiX className="h-6 w-6" aria-hidden="true" />
            ) : (
              <FiFilter className="h-6 w-6" aria-hidden="true" />
            )}
            <span className="sr-only">{isFilterOpen ? "بستن فیلتر" : "باز کردن فیلتر"}</span>
          </button>
        </div>
        <div
          id="customer-filter-panel"
          className={`overflow-hidden transition-all duration-500 ease-in-out ${
            isFilterOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="border-t border-gray-200">
            <CustomerFilter />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-2 sm:px-4 py-6">
        {initialLoad && customers.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <BeatLoader color="#0D9488" loading={true} size={15} />
            <p className="mr-3 text-lg text-gray-600">درحال بارگذاری مشتریان...</p>
          </div>
        ) : customers.length > 0 ? (
          <div className="grid grid-cols-1  gap-6 sm:gap-8">
            {customerCards}
          </div>
        ) : (
          !isFetching && (
            <div className="text-center py-10">
              <FiUsers className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">مشتری یافت نشد</h3>
              <p className="mt-1 text-sm text-gray-500">با تغییر فیلترها مجددا تلاش کنید یا بعدا سر بزنید.</p>
            </div>
          )
        )}

        {isFetching && !initialLoad && (
          <div className="flex justify-center py-8">
            <BeatLoader color="#0D9488" loading={true} size={10} />
            <p className="mr-2 text-sm text-gray-500">بارگذاری موارد بیشتر...</p>
          </div>
        )}
        {!isFetching && !hasMore && customers.length > 0 && (
          <p className="text-center text-gray-500 py-6 text-sm">به انتهای لیست رسیده‌اید.</p>
        )}
      </main>
      <ScrollButton />
    </div>
  );
};

export default Customers;
