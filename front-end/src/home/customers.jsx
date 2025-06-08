// File: Customers.jsx
import CustomerCard from "./customer_card";
import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { api } from "../common/api";
import { addCustomers, setCustomers, setLastFilter as setCustomerLastFilter, clearLastFilter as clearCustomerLastFilter } from "./customersSlice"; // Ensure these actions are correct
import { useSelector, useDispatch } from "react-redux";
import ScrollButton from "../common/goUpButton";
import CustomerFilter from "./customer_filter"; // Changed import
import BeatLoader from "react-spinners/BeatLoader";
import { FiUsers, FiFilter } from "react-icons/fi"; // FiX removed as modal has its own

const Customers = () => {
  const { customers, lastFilter } = useSelector((state) => state.customers); // lastFilter from customers slice
  const dispatch = useDispatch();
  const [pageNumber, setPageNumber] = useState(1);
  const [isFetching, setIsFetching] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false); // Modal state
  const observer = useRef();

  const defaultCustomerFilter = useMemo(() => ({
    status: "ACTIVE",
    customer_type: localStorage.getItem("agents_field") === "sell" ? "buy" : "rent"
  }), []);

  // Determine if a user-defined filter is currently active
  const isFilterActive = useMemo(() => {
    // Check if lastFilter is not null and has keys beyond the default ones if necessary,
    // or simply if it's truthy (meaning an object, not null)
    return !!lastFilter; 
  }, [lastFilter]);

  const getCustomers = useCallback(async (pageToFetch, isNewFilter = false) => {
    if (isNewFilter) {
        setInitialLoad(true); // For new filters, show main loader
    }
    setIsFetching(true);

    try {
      const filterParams = lastFilter || defaultCustomerFilter;
      const response = await api.get(`/listing/customers/?page=${pageToFetch}`, { params: filterParams });
      
      const validResults = response.data.results.filter(item => item?.id && typeof item === 'object');
      if (validResults.length !== response.data.results.length) {
        console.warn("API returned some invalid customer items:", response.data.results);
      }

      if (isNewFilter) {
        dispatch(setCustomers(validResults));
        setPageNumber(1); // Reset page for new filter
      } else {
        dispatch(addCustomers(validResults));
        setPageNumber(prev => prev + 1);
      }
      setHasMore(response.data.next !== null);
    } catch (error) {
      console.error("Error fetching customers:", error);
      setHasMore(false);
    } finally {
      setIsFetching(false);
      if (isNewFilter) {
        setInitialLoad(false); // Stop main loader after new filter data is fetched
      }
    }
  }, [dispatch, lastFilter, defaultCustomerFilter]);


  useEffect(() => {
    // This effect runs on initial mount and when lastFilter or defaultCustomerFilter changes.
    // getCustomers itself is stable due to useCallback.
    getCustomers(1, true); // Fetch page 1, treat as new filter
  }, [lastFilter, defaultCustomerFilter, getCustomers]);


  useEffect(() => {
    const currentObserver = observer.current;
    return () => {
      if (currentObserver) {
        currentObserver.disconnect();
      }
    };
  }, []);

  const lastCustomerElementRef = useCallback((node) => {
    if (isFetching || initialLoad || !hasMore) { // Don't observe if initialLoad is true
      if (observer.current) observer.current.disconnect();
      return;
    }
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && !isFetching && hasMore) { // Double check conditions
          getCustomers(pageNumber + 1, false); // Fetch next page, not a new filter
        }
      },
      { threshold: 0.1, rootMargin: "200px" }
    );

    if (node) observer.current.observe(node);
  }, [isFetching, hasMore, pageNumber, getCustomers, initialLoad]);

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

  const openFilterModal = () => setIsFilterModalOpen(true);
  const closeFilterModal = () => setIsFilterModalOpen(false);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') closeFilterModal();
    };
    if (isFilterModalOpen) document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isFilterModalOpen]);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-md sticky top-0 z-40"> {/* z-40 so modal is above */}
       <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <FiUsers className="h-7 w-7 text-teal-600 mr-2 rtl:mr-0 rtl:ml-2" />
            <h1 className="text-xl sm:text-2xl font-semibold text-teal-700">لیست مشتریان</h1>
          </div>
          <button
            onClick={openFilterModal}
            className="relative p-2 rounded-md text-teal-600 hover:bg-teal-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
            aria-label={isFilterActive ? "ویرایش فیلتر متقاضیان فعال" : "باز کردن فیلتر متقاضیان"}
            title={isFilterActive ? "فیلتر متقاضیان فعال است - کلیک برای ویرایش" : "باز کردن فیلتر متقاضیان"}
          >
            <FiFilter className="h-6 w-6" />
            {isFilterActive && (
              <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-red-500 ring-1 ring-white" aria-hidden="true">
                 <span className="sr-only">فیلتر فعال است</span>
              </span>
            )}
          </button>
        </div>
        {/* Collapsible panel removed */}
      </header>

      {/* Customer Filter Modal */}
      {isFilterModalOpen && (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4"
            onClick={closeFilterModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="customer-filter-dialog-title"
        >
          <div 
            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()} 
          >
            <CustomerFilter onCloseDialog={closeFilterModal} />
          </div>
        </div>
      )}

      <main className="container mx-auto px-2 sm:px-4 py-6">
        {initialLoad && customers.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <BeatLoader color="#0D9488" loading={true} size={15} /> {/* Teal color */}
            <p className="mr-3 text-lg text-gray-600">درحال بارگذاری متقاضیان...</p>
          </div>
        ) : customers.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:gap-8">
            {customerCards}
          </div>
        ) : (
          !isFetching && !initialLoad && (
            <div className="text-center py-10">
              <FiUsers className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">متقاضی یافت نشد</h3>
              <p className="mt-1 text-sm text-gray-500">با تغییر فیلترها مجددا تلاش کنید یا بعدا سر بزنید.</p>
            </div>
          )
        )}
        {isFetching && !initialLoad && (
          <div className="flex justify-center py-8">
            <BeatLoader color="#0D9488" loading={true} size={10} /> {/* Teal color */}
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
