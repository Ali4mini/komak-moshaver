// File: CustomerFilter.jsx
import { useEffect, useState, useCallback, useMemo } from "react";
import FloatLabel from "../common/input";
import Checkbox from "../common/checkbox";
import { api } from "../common/api";
import { useDispatch, useSelector } from "react-redux";
import { setCustomers, setLastFilter as setCustomerLastFilter, clearLastFilter as clearCustomerLastFilter } from "./customersSlice";
import { FiX } from "react-icons/fi";

const selectClasses = "block w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm";

const CustomerFilter = ({ onCloseDialog }) => {
  const dispatch = useDispatch();
  const lastFilterFromStore = useSelector((state) => state.customers.lastFilter);

  const initialGlobalCustomerType = useMemo(() => localStorage.getItem("agents_field") === "sell" ? "buy" : "rent", []);

  // Local state for form fields - mirroring Filter.jsx structure
  const [customerType, setCustomerType] = useState(initialGlobalCustomerType);
  const [propertyType, setPropertyType] = useState("A"); // Default

  // These are for direct user input, analogous to 'price', 'priceUp', 'priceRent' in Filter.jsx
  const [budget, setBudget] = useState(null);
  const [budgetUp, setBudgetUp] = useState(null);
  const [budgetRent, setBudgetRent] = useState(null);

  const [m2, setM2] = useState(null); // API uses m2__lte for customers
  const [bedroom, setBedroom] = useState(null); // API uses bedroom__lte
  const [year, setYear] = useState(null); // API uses year__lte

  const [parking, setParking] = useState(false); // Default to false
  const [elevator, setElevator] = useState(false);
  const [storage, setStorage] = useState(false);

  const [checkboxKeyPrefix, setCheckboxKeyPrefix] = useState(Date.now());

  // Effect to update local state if lastFilterFromStore changes
  useEffect(() => {
    if (lastFilterFromStore) {
      const ct = lastFilterFromStore.customer_type || initialGlobalCustomerType;
      setCustomerType(ct);
      setPropertyType(lastFilterFromStore.property_type || "A");

      if (ct === 'buy') {
        // Retrieve the 'inputted' budget value from store
        setBudget(lastFilterFromStore.budget_input !== undefined ? lastFilterFromStore.budget_input : null);
        setBudgetUp(null);
        setBudgetRent(null);
      } else { // 'rent'
        setBudgetUp(lastFilterFromStore.up_budget_input !== undefined ? lastFilterFromStore.up_budget_input : null);
        setBudgetRent(lastFilterFromStore.rent_budget_input !== undefined ? lastFilterFromStore.rent_budget_input : null);
        setBudget(null);
      }
      // For customers, API might use __lte, but form should show the value user typed.
      // Assuming lastFilterFromStore stores the direct input if it's different from the API param name.
      // If lastFilterFromStore.m2, .bedroom, .year are meant to be the direct inputs:
      setM2(lastFilterFromStore.m2_input !== undefined ? lastFilterFromStore.m2_input : (lastFilterFromStore.m2__lte !== undefined ? lastFilterFromStore.m2__lte : null));
      setBedroom(lastFilterFromStore.bedroom_input !== undefined ? lastFilterFromStore.bedroom_input : (lastFilterFromStore.bedroom__lte !== undefined ? lastFilterFromStore.bedroom__lte : null));
      setYear(lastFilterFromStore.year_input !== undefined ? lastFilterFromStore.year_input : (lastFilterFromStore.year__lte !== undefined ? lastFilterFromStore.year__lte : null));
      
      setParking(lastFilterFromStore.parking || false);
      setElevator(lastFilterFromStore.elevator || false);
      setStorage(lastFilterFromStore.storage || false);
      setCheckboxKeyPrefix(Date.now()); // Ensure checkboxes reflect store on load
    }
    // No "else" block to reset fields here; reset is handled by handleCancelFilter or initial state
  }, [lastFilterFromStore, initialGlobalCustomerType]);


  // Budget range calculation (specific to customers)
  const getCustomerBudgetRange = (basePrice, type) => {
    if (basePrice === null || basePrice === "" || isNaN(Number(basePrice))) return [null, null];
    const numericPrice = Number(basePrice);
    if (numericPrice === 0) return [null, null];
    let factorLower, factorUpper;
    if (type === "buy_main") { factorLower = 0.8; factorUpper = 1.2; }
    else if (type === "rent_deposit") { factorLower = 0.8; factorUpper = 1.2; }
    else { factorLower = 0.7; factorUpper = 1.3; } // rent_monthly
    const GTE = Math.floor(numericPrice * factorLower); // Customer is looking for properties AT LEAST this much
    const LTE = Math.floor(numericPrice * factorUpper); // Customer is looking for properties AT MOST this much
    return [GTE, LTE]; // For customer budget, this range might mean their budget falls within it
                                 // Or API expects a range of properties matching this customer's budget.
                                 // The API field names (e.g. budget__gte for customer means customer budget >= X)
                                 // will clarify. For now, matching Filter.jsx style.
  };

  const handleFilterSubmit = useCallback(() => {
    // This payload will be saved to Redux and used as a base for API call
    let filterPayload = {
      status: "ACTIVE", // Default API param
      customer_type: customerType,
      property_type: propertyType,

      // Store direct inputs for form repopulation (like Filter.jsx's price, priceUp, priceRent)
      budget_input: budget ? Number(budget) : null,
      up_budget_input: budgetUp ? Number(budgetUp) : null,
      rent_budget_input: budgetRent ? Number(budgetRent) : null,
      
      // Store direct inputs for m2, bedroom, year if they are used in form
      // and API uses different fields (e.g. m2__lte)
      m2_input: m2 ? Number(m2) : null,
      bedroom_input: bedroom ? Number(bedroom) : null,
      year_input: year ? Number(year) : null,

      // API specific fields (can be overridden/added to below)
      ...(m2 && { m2__lte: Number(m2) }), // Customer wants UP TO this m2
      ...(bedroom && { bedroom__lte: Number(bedroom) }), // Customer wants UP TO this many bedrooms
      ...(year && { year__lte: Number(year) }), // Customer wants property built UP TO this year (newer) -> year__gte would mean at least this old. Check API logic. Assuming year__lte means "max year" (newer is lower number, so this is max age) No, year__lte implies "max year of construction", so a property built in 2010 is year__lte=2010. A customer wanting newer means they want a higher year. year_max_construction_age.
                                                  // Let's assume the current __lte is correct as per original code's intent for now.

      ...(parking && { parking: true }),
      ...(elevator && { elevator: true }),
      ...(storage && { storage: true }),
    };

    if (customerType === "buy") {
      // For a customer's budget, if their budget is X, they are looking for properties
      // with price_listing__gte = X * 0.8 and price_listing__lte = X * 1.2
      // So, the API fields for customer budget might be budget_amount_gte / budget_amount_lte
      // OR listing_price_gte / listing_price_lte.
      // Assuming getCustomerBudgetRange calculates the range of *listing prices* this customer is interested in.
      const [listingPriceGte, listingPriceLte] = getCustomerBudgetRange(budget, "buy_main");
      if (listingPriceGte !== null) filterPayload.budget__gte = listingPriceGte; // Customer's budget is at least this
      if (listingPriceLte !== null) filterPayload.budget__lte = listingPriceLte; // Customer's budget is at most this
    } else if (customerType === "rent") {
      const [upGte, upLte] = getCustomerBudgetRange(budgetUp, "rent_deposit");
      const [rentGte, rentLte] = getCustomerBudgetRange(budgetRent, "rent_monthly");
      if (upGte !== null) filterPayload.up_budget__gte = upGte;
      if (upLte !== null) filterPayload.up_budget__lte = upLte;
      if (rentGte !== null) filterPayload.rent_budget__gte = rentGte;
      if (rentLte !== null) filterPayload.rent_budget__lte = rentLte;
    }
    
    // Create a separate payload for the API, cleaning out the _input fields if they are not API params
    let apiParams = { ...filterPayload };
    delete apiParams.budget_input;
    delete apiParams.up_budget_input;
    delete apiParams.rent_budget_input;
    delete apiParams.m2_input;
    delete apiParams.bedroom_input;
    delete apiParams.year_input;
    
    // Clean up undefined or null range values from API payload
    Object.keys(apiParams).forEach(key => {
        if (apiParams[key] === null || apiParams[key] === undefined || apiParams[key] === "") {
            delete apiParams[key];
        }
    });
    
    // Clean the filterPayload (for Redux) of any null/undefined values for non-input fields if desired,
    // but typically we store what's needed to reconstruct the form and API call.
    // For now, `filterPayload` will store the richer object.
    Object.keys(filterPayload).forEach(key => {
        if (filterPayload[key] === undefined) { // Allow nulls for inputs, remove only undefined
            delete filterPayload[key];
        }
    });

    api.get("listing/customers/", { params: apiParams })
      .then((response) => {
        dispatch(setCustomers(response.data.results));
        dispatch(setCustomerLastFilter(filterPayload)); // Save the richer payload with inputs
        if (onCloseDialog) onCloseDialog();
      })
      .catch((error) => console.error("Customer Filter API error:", error));
  }, [customerType, propertyType, budget, budgetUp, budgetRent, m2, bedroom, year, parking, elevator, storage, dispatch, onCloseDialog]);

  const handleCancelFilter = useCallback(() => {
    dispatch(clearCustomerLastFilter());
    // Reset local component state explicitly
    setCustomerType(initialGlobalCustomerType);
    setPropertyType("A");
    setBudget(null); setBudgetUp(null); setBudgetRent(null);
    setM2(null); setBedroom(null); setYear(null);
    setParking(false); setElevator(false); setStorage(false);
    setCheckboxKeyPrefix(Date.now()); // Force re-mount of checkboxes

    api.get("/listing/customers/?page=1", { params: { status: "ACTIVE", customer_type: initialGlobalCustomerType } })
      .then((response) => {
        dispatch(setCustomers(response.data.results));
      })
      .catch((error) => console.error("Error fetching initial customers:", error));
    
    if (onCloseDialog) onCloseDialog();
  }, [dispatch, initialGlobalCustomerType, onCloseDialog]);

  // Mirrored from Filter.jsx - assuming Checkbox component calls its setter prop as:
  // setterPropPassedToCheckbox((prevStateInCheckbox) => (prevStateInCheckbox ? null : true))
  // AND our component's state (e.g. `parking`) is always boolean.
  const handleCheckboxChange = (setterFn, currentVal) => {
    // This logic toggles a boolean state. If Checkbox component itself handles its own state
    // and calls setterFn with the new boolean value, this could be simpler.
    // But to match Filter.jsx:
    const newValueFromCheckboxPerspective = currentVal ? null : true; // What the Checkbox updater would yield if currentVal was its internal state
    const newBooleanState = newValueFromCheckboxPerspective === null ? false : newValueFromCheckboxPerspective; // Normalize to boolean for our state
    setterFn(newBooleanState);

    // Simplified version if `currentVal` is always boolean and we just toggle:
    // setterFn(!currentVal);
    // The Filter.jsx logic for `handleCheckboxChange` is a bit complex.
    // `const newValue = currentVal === null ? true : (currentVal ? null : true);`
    // `setterFn(newValue === null ? false : newValue);`
    // If currentVal is our boolean state (e.g. `parking`), then it's never null.
    // So `currentVal === null` is false.
    // `newValue = (currentVal ? null : true)`
    // `setterFn(newValue === null ? false : newValue)`
    // Example: currentVal = false (parking is false)
    //   `newValue = (false ? null : true)` -> `true`
    //   `setterFn(true === null ? false : true)` -> `setterFn(true)` -> Correct toggle
    // Example: currentVal = true (parking is true)
    //   `newValue = (true ? null : true)` -> `null`
    //   `setterFn(null === null ? false : null)` -> `setterFn(false)` -> Correct toggle
    // So, Filter.jsx's logic works for toggling a boolean state and will be replicated here.
  };

  const floatInputSetter = (setter, value) => {
    setter(value === "" ? null : value); // Store empty as null, otherwise the value
  };

  return (
    <div className="p-1">
      <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200">
        <h2 id="customer-filter-dialog-title" className="text-lg font-semibold text-gray-800">فیلتر متقاضیان</h2>
        {onCloseDialog && (
          <button onClick={onCloseDialog} className="p-1 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500" aria-label="بستن فیلتر متقاضیان">
            <FiX className="h-5 w-5" />
          </button>
        )}
      </div>
      <form id="customer-filter-form" onSubmit={(e) => { e.preventDefault(); handleFilterSubmit(); }} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6 items-end">
          <div>
            <label htmlFor="customer_type_filter" className="block text-sm font-medium text-gray-700 mb-1">نوع متقاضی</label>
            <select name="customer_type_filter" id="customer_type_filter" value={customerType} onChange={(e) => setCustomerType(e.target.value)} className={selectClasses}>
              <option value="buy">متقاضی خرید</option>
              <option value="rent">متقاضی اجاره</option>
            </select>
          </div>
          <div>
            <label htmlFor="customer_property_type_filter" className="block text-sm font-medium text-gray-700 mb-1">نوع ملک مدنظر</label>
            <select name="customer_property_type_filter" id="customer_property_type_filter" value={propertyType} onChange={(e) => setPropertyType(e.target.value)} className={selectClasses}>
              <option value="A">آپارتمان</option><option value="L">زمین</option><option value="S">مغازه</option><option value="H">خانه و ویلا</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-8">
          {customerType === "buy" ? (
            <FloatLabel label="بودجه مدنظر (تومان)" name="customer_budget_filter" type="number" value={budget || ""} setter={(val) => floatInputSetter(setBudget, val)} />
          ) : (
            <>
              <FloatLabel label="ودیعه مدنظر (تومان)" name="customer_budget_up_filter" type="number" value={budgetUp || ""} setter={(val) => floatInputSetter(setBudgetUp, val)} />
              <FloatLabel label="اجاره مدنظر (تومان)" name="customer_budget_rent_filter" type="number" value={budgetRent || ""} setter={(val) => floatInputSetter(setBudgetRent, val)} />
            </>
          )}
          {/* Note: Label says "حداکثر متر مربع" - for customer, this implies m2__lte (they want up to this size) */}
          <FloatLabel label="متراژ (حداکثر متر مربع)" name="customer_m2_filter" type="number" value={m2 || ""} setter={(val) => floatInputSetter(setM2, val)} placeholder="مثال: 150" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-8">
           {/* Note: "سال ساخت (حداکثر)" - if it means "max age", then older year. If "max year of construction", then newer year.
               Assuming it means customer wants a property *no older than* X years, or *built up to year* X.
               If API uses `year__lte` (e.g. year__lte=2000 means buildings from 2000 or older), then this matches.
               If customer wants "at most 10 years old", it's more complex.
               The original uses year__lte, so keeping that. The label "حداکثر" could be ambiguous.
            */}
          {propertyType !== "L" && (
            <FloatLabel label="سال ساخت (حداکثر)" name="customer_year_filter" type="number" value={year || ""} setter={(val) => floatInputSetter(setYear, val)} placeholder="مثال: 1395" />
          )}
          {/* Note: "تعداد اتاق خواب (حداکثر)" - implies bedroom__lte */}
          {(propertyType === "A" || propertyType === "H") && (
            <FloatLabel label="تعداد اتاق خواب (حداکثر)" name="customer_bedroom_filter" type="number" value={bedroom || ""} setter={(val) => floatInputSetter(setBedroom, val)} placeholder="مثال: 3" />
          )}
        </div>

        {propertyType !== "L" && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">امکانات مدنظر:</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1">
              <Checkbox
                key={`customer-parking-filter-${checkboxKeyPrefix}`}
                label="پارکینگ"
                name="customer_parking_filter"
                isChecked={Boolean(parking)} // Pass boolean
                // The setter in Filter.jsx is: (updaterFn) => handleCheckboxChange(setParking, parking)
                // This implies Checkbox calls its prop with an updater. We pass our state setter and current value.
                setter={(updaterFnFromCheckbox) => handleCheckboxChange(setParking, parking)}
              />
              <Checkbox
                key={`customer-elevator-filter-${checkboxKeyPrefix}`}
                label="آسانسور"
                name="customer_elevator_filter"
                isChecked={Boolean(elevator)}
                setter={(updaterFnFromCheckbox) => handleCheckboxChange(setElevator, elevator)}
              />
              <Checkbox
                key={`customer-storage-filter-${checkboxKeyPrefix}`}
                label="انباری"
                name="customer_storage_filter"
                isChecked={Boolean(storage)}
                setter={(updaterFnFromCheckbox) => handleCheckboxChange(setStorage, storage)}
              />
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-4 border-t border-gray-200">
          {lastFilterFromStore && Object.keys(lastFilterFromStore).length > 0 && ( // Show if any filter is set
             <button type="button" onClick={handleCancelFilter} className="w-full sm:w-auto px-6 py-2.5 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
              حذف فیلتر
            </button>
          )}
          <button type="submit" className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 text-sm font-medium rounded-lg text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
            اعمال فیلتر متقاضی
          </button>
        </div>
      </form>
    </div>
  );
};

export default CustomerFilter;
