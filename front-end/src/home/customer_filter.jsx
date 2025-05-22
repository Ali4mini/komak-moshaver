// File: Customers/Filter.jsx
import { useEffect, useState, useCallback, useMemo } from "react";
import FloatLabel from "../common/input"; // Assuming this is your existing FloatLabel
import Checkbox from "../common/checkbox";   // Assuming this is your existing Checkbox
import { api } from "../common/api";
import { useDispatch, useSelector } from "react-redux";
// Make sure these actions are correct for your customersSlice
import { setCustomers, setLastFilter, clearLastFilter, addCustomers } from "./customersSlice";

// Select styling from the reference component
const selectClasses = "block w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500";

const Filter = () => {
  const dispatch = useDispatch();
  // Ensure you're selecting from the correct slice: state.customers
  const lastFilterFromStore = useSelector((state) => state.customers.lastFilter);

  // Determine initial customer type (buy/rent)
  const initialGlobalCustomerType = useMemo(() => localStorage.getItem("agents_field") === "sell" ? "buy" : "rent", []);

  // Local state for form fields
  const [customerType, setCustomerType] = useState(lastFilterFromStore?.customer_type || initialGlobalCustomerType);
  const [propertyType, setPropertyType] = useState(lastFilterFromStore?.property_type || "A");

  // Budget fields for Customers (buy/rent)
  const [budget, setBudget] = useState(lastFilterFromStore?.budget_input || null); // User's direct input for 'buy'
  const [budgetUp, setBudgetUp] = useState(lastFilterFromStore?.up_budget_input || null); // User's direct input for 'rent' deposit
  const [budgetRent, setBudgetRent] = useState(lastFilterFromStore?.rent_budget_input || null); // User's direct input for 'rent' monthly

  const [m2, setM2] = useState(lastFilterFromStore?.m2__lte || null); // Using __lte as per original customers filter logic
  const [bedroom, setBedroom] = useState(lastFilterFromStore?.bedroom__lte || null); // Using __lte
  const [year, setYear] = useState(lastFilterFromStore?.year__lte || null); // Using __lte

  // Checkbox states - store as boolean to match reference's handling
  const [parking, setParking] = useState(lastFilterFromStore?.parking || false);
  const [elevator, setElevator] = useState(lastFilterFromStore?.elevator || false);
  const [storage, setStorage] = useState(lastFilterFromStore?.storage || false);

  // Key for re-mounting checkboxes (from reference component)
  const [checkboxKeyPrefix, setCheckboxKeyPrefix] = useState(Date.now());

  // Effect to update local state if lastFilterFromStore changes
  useEffect(() => {
    if (lastFilterFromStore) {
      const ct = lastFilterFromStore.customer_type || initialGlobalCustomerType;
      setCustomerType(ct);
      setPropertyType(lastFilterFromStore.property_type || "A");

      if (ct === 'buy') {
        setBudget(lastFilterFromStore.budget_input !== undefined ? lastFilterFromStore.budget_input : null);
        setBudgetUp(null);
        setBudgetRent(null);
      } else { // 'rent'
        setBudgetUp(lastFilterFromStore.up_budget_input !== undefined ? lastFilterFromStore.up_budget_input : null);
        setBudgetRent(lastFilterFromStore.rent_budget_input !== undefined ? lastFilterFromStore.rent_budget_input : null);
        setBudget(null);
      }

      setM2(lastFilterFromStore.m2__lte !== undefined ? lastFilterFromStore.m2__lte : null);
      setBedroom(lastFilterFromStore.bedroom__lte !== undefined ? lastFilterFromStore.bedroom__lte : null);
      setYear(lastFilterFromStore.year__lte !== undefined ? lastFilterFromStore.year__lte : null);

      setParking(Boolean(lastFilterFromStore.parking));
      setElevator(Boolean(lastFilterFromStore.elevator));
      setStorage(Boolean(lastFilterFromStore.storage));
      setCheckboxKeyPrefix(Date.now()); // Ensure checkboxes reflect store on load
    } else {
        // If no lastFilter, reset to defaults
        setCustomerType(initialGlobalCustomerType);
        setPropertyType("A");
        setBudget(null); setBudgetUp(null); setBudgetRent(null);
        setM2(null); setBedroom(null); setYear(null);
        setParking(false); setElevator(false); setStorage(false);
        setCheckboxKeyPrefix(Date.now());
    }
  }, [lastFilterFromStore, initialGlobalCustomerType]);


  // Budget range calculation (adapted from your original customer filter)
  const getCustomerBudgetRange = (basePrice, type) => {
    if (basePrice === null || basePrice === "" || isNaN(Number(basePrice))) return [null, null];
    const numericPrice = Number(basePrice);
    if (numericPrice === 0) return [null, null];

    let factorLower, factorUpper;
    if (type === "buy_main") { // For 'buy' budget
      factorLower = 0.8; factorUpper = 1.2;
    } else if (type === "rent_deposit") { // For 'rent' up_budget (deposit)
      factorLower = 0.8; factorUpper = 1.2;
    } else { // rent_monthly
      factorLower = 0.7; factorUpper = 1.3;
    }
    const lowerBound = Math.floor(numericPrice * factorLower);
    const upperBound = Math.floor(numericPrice * factorUpper);
    return [lowerBound, upperBound];
  };


  const handleFilterSubmit = useCallback(() => {
    // This object is for saving to lastFilter in Redux store
    const filterStateToSave = {
        customer_type: customerType,
        property_type: propertyType,
        budget_input: customerType === 'buy' ? budget : null,
        up_budget_input: customerType === 'rent' ? budgetUp : null,
        rent_budget_input: customerType === 'rent' ? budgetRent : null,
        m2__lte: m2 ? Number(m2) : null,
        bedroom__lte: bedroom ? Number(bedroom) : null,
        year__lte: year ? Number(year) : null,
        parking: parking, // Save boolean
        elevator: elevator,
        storage: storage,
    };
    
    // This object is for the API call
    let apiPayload = {
      status: "ACTIVE", // As per your original customer filter
      customer_type: customerType,
      property_type: propertyType,
      ...(m2 && { m2__lte: Number(m2) }),
      ...(bedroom && { bedroom__lte: Number(bedroom) }),
      ...(year && { year__lte: Number(year) }),
      ...(parking && { parking: true }), // Only send if true
      ...(elevator && { elevator: true }),
      ...(storage && { storage: true }),
    };

    if (customerType === "buy") {
      const [gte, lte] = getCustomerBudgetRange(budget, "buy_main");
      if (gte !== null) apiPayload.budget__gte = gte;
      if (lte !== null) apiPayload.budget__lte = lte;
    } else if (customerType === "rent") {
      const [upGte, upLte] = getCustomerBudgetRange(budgetUp, "rent_deposit");
      const [rentGte, rentLte] = getCustomerBudgetRange(budgetRent, "rent_monthly");
      if (upGte !== null) apiPayload.up_budget__gte = upGte;
      if (upLte !== null) apiPayload.up_budget__lte = upLte;
      if (rentGte !== null) apiPayload.rent_budget__gte = rentGte;
      if (rentLte !== null) apiPayload.rent_budget__lte = rentLte;
    }
    
    // Clean up undefined or null values from API payload before sending
    Object.keys(apiPayload).forEach(key => {
        if (apiPayload[key] === null || apiPayload[key] === undefined) {
            delete apiPayload[key];
        }
    });

    // API endpoint for customers
    api.get("listing/customers/", { params: apiPayload })
      .then((response) => {
        dispatch(setCustomers(response.data.results)); // Use customer-specific action
        dispatch(setLastFilter(filterStateToSave));  // Save the form state to lastFilter
      })
      .catch((error) => console.error("Customer Filter API error:", error));
  }, [customerType, propertyType, budget, budgetUp, budgetRent, m2, bedroom, year, parking, elevator, storage, dispatch]);

  const handleCancelFilter = useCallback(() => {
    dispatch(clearLastFilter()); // This will trigger the useEffect to reset form fields

    // Fetch initial data for customers
    api.get("/listing/customers/?page=1", { 
        params: { 
            status: "ACTIVE", 
            // file_type from localStorage is for the overall agent's view,
            // customer_type for filter should align with initialGlobalCustomerType or be dynamic
            // For consistency, let's use the default derived from localStorage:
            customer_type: initialGlobalCustomerType 
        } 
    })
      .then((response) => {
        // Assuming setCustomers replaces, and addCustomers appends
        if (response.data.previous === null) {
          dispatch(setCustomers(response.data.results));
        } else if (response.data.next && dispatch(addCustomers)) { // Check if addCustomers exists
          dispatch(addCustomers(response.data.results));
        } else {
          dispatch(setCustomers(response.data.results)); // Fallback
        }
      })
      .catch((error) => console.error("Error fetching initial customers:", error));
  }, [dispatch, initialGlobalCustomerType]);

  // Adapt checkbox change handler (from reference)
  // This assumes your Checkbox component's 'setter' prop is called with the new value (true/false)
  // or that it expects an updater function. The reference component implies the latter.
  // For simplicity, let's assume your Checkbox calls setter(newValue)
  const handleCheckboxChange = (setterFn, currentVal) => {
    setterFn(!currentVal); // Simple toggle if currentVal is boolean
  };

  const floatInputSetter = (setter, value) => {
    setter(value === "" ? null : value);
  };


  return (
    // --- UI structure from the reference component ---
    <div className="bg-gray-50 dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-lg my-6 mx-auto max-w-5xl">
      <form
        id="customer-filter-form" // Unique ID
        onSubmit={(e) => { e.preventDefault(); handleFilterSubmit(); }}
        className="space-y-6"
      >
        {/* Row 1: Customer Type & Property Type */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6 items-end">
          <div>
            <label htmlFor="customer_type_filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">نوع متقاضی</label>
            <select
              name="customer_type_filter"
              id="customer_type_filter"
              value={customerType}
              onChange={(e) => setCustomerType(e.target.value)}
              className={selectClasses}
            >
              <option value="buy">متقاضی خرید</option>
              <option value="rent">متقاضی اجاره</option>
            </select>
          </div>
          <div>
            <label htmlFor="customer_property_type_filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">نوع ملک مدنظر</label>
            <select
              name="customer_property_type_filter"
              id="customer_property_type_filter"
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              className={selectClasses}
            >
              <option value="A">آپارتمان</option>
              <option value="L">زمین</option>
              <option value="S">مغازه</option>
              <option value="H">خانه و ویلا</option>
              {/* Add other property types if needed */}
            </select>
          </div>
        </div>

        {/* Row 2: Budget Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-8">
          {customerType === "buy" ? (
            <FloatLabel 
              label="بودجه مدنظر (تومان)" 
              name="customer_budget_filter" 
              type="number" 
              value={budget || ""} 
              setter={(val) => floatInputSetter(setBudget, val)} 
            />
          ) : (
            <>
              <FloatLabel 
                label="ودیعه مدنظر (تومان)" 
                name="customer_budget_up_filter" 
                type="number" 
                value={budgetUp || ""} 
                setter={(val) => floatInputSetter(setBudgetUp, val)} 
              />
              <FloatLabel 
                label="اجاره مدنظر (تومان)" 
                name="customer_budget_rent_filter" 
                type="number" 
                value={budgetRent || ""} 
                setter={(val) => floatInputSetter(setBudgetRent, val)} 
              />
            </>
          )}
          {/* Common fields, adjust grid col-span if budgets take more space */}
          <FloatLabel 
            label="متراژ (حداکثر متر مربع)" 
            name="customer_m2_filter" 
            type="number" 
            value={m2 || ""} 
            setter={(val) => floatInputSetter(setM2, val)} 
            placeholder="مثال: 150"
          />
        </div>
        
        {/* Row 3: More Specifications - Conditionally shown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-8">
          {/* Year and Bedroom are not typically relevant for 'زمین' (Land) */}
          {propertyType !== "L" && (
            <FloatLabel 
              label="سال ساخت (حداکثر)" 
              name="customer_year_filter" 
              type="number" 
              value={year || ""} 
              setter={(val) => floatInputSetter(setYear, val)} 
              placeholder="مثال: 1395"
            />
          )}
          {/* Bedrooms only for property types that have them */}
          {(propertyType === "A" || propertyType === "H") && (
            <FloatLabel 
              label="تعداد اتاق خواب (حداکثر)" 
              name="customer_bedroom_filter" 
              type="number" 
              value={bedroom || ""} 
              setter={(val) => floatInputSetter(setBedroom, val)} 
              placeholder="مثال: 3"
            />
          )}
        </div>


        {/* Row 4: Amenities - Conditionally shown */}
        {propertyType !== "L" && ( // Amenities not for "زمین"
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">امکانات مدنظر:</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1">
              <Checkbox
                key={`customer-parking-filter-${checkboxKeyPrefix}`}
                label="پارکینگ"
                name="customer_parking_filter"
                // Assuming your Checkbox takes `checked` and `setter` gets the new boolean value
                checked={parking} // Pass boolean
                setter={() => handleCheckboxChange(setParking, parking)}
              />
              <Checkbox
                key={`customer-elevator-filter-${checkboxKeyPrefix}`}
                label="آسانسور"
                name="customer_elevator_filter"
                checked={elevator}
                setter={() => handleCheckboxChange(setElevator, elevator)}
              />
              <Checkbox
                key={`customer-storage-filter-${checkboxKeyPrefix}`}
                label="انباری"
                name="customer_storage_filter"
                checked={storage}
                setter={() => handleCheckboxChange(setStorage, storage)}
              />
            </div>
          </div>
        )}

        {/* Row 5: Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          {/* Show cancel button if a filter is potentially active (lastFilterFromStore exists) */}
          {lastFilterFromStore && Object.keys(lastFilterFromStore).length > 0 && (
            <button
              type="button"
              onClick={handleCancelFilter}
              className="w-full sm:w-auto px-6 py-2.5 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              حذف فیلتر
            </button>
          )}
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 text-sm font-medium rounded-lg text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors dark:bg-indigo-500 dark:hover:bg-indigo-600"
          >
            اعمال فیلتر متقاضی
          </button>
        </div>
      </form>
    </div>
  );
};

export default Filter;
