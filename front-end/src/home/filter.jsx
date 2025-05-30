// File: Filter.jsx
import { useEffect, useState, useCallback } from "react";
import FloatLabel from "../common/input";
import Checkbox from "../common/checkbox"; // Your existing Checkbox
import { api } from "../common/api";
import { useDispatch, useSelector } from "react-redux";
import { setFiles, setLastFilter, clearLastFilter } from "./filesSlice"; // Removed addFiles if not used here directly

// Select styling
const selectClasses = "block w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm";

const Filter = () => {
  const dispatch = useDispatch();
  const lastFilterFromStore = useSelector((state) => state.files.lastFilter);

  // Local state for form fields
  const [fileType, setFileType] = useState(localStorage.getItem("agents_field") || "sell");
  const [propertyType, setPropertyType] = useState(lastFilterFromStore?.property_type || "A");
  const [price, setPrice] = useState(lastFilterFromStore?.price || null); // Assuming API sends price for sell filter
  const [priceUp, setPriceUp] = useState(lastFilterFromStore?.price_up || null); // Assuming API sends price_up for rent
  const [priceRent, setPriceRent] = useState(lastFilterFromStore?.price_rent || null);
  const [m2, setM2] = useState(lastFilterFromStore?.m2__gte || null);
  const [bedroom, setBedroom] = useState(lastFilterFromStore?.bedroom__gte || null);
  const [year, setYear] = useState(lastFilterFromStore?.year__gte || null);
  const [parking, setParking] = useState(lastFilterFromStore?.parking || false); // Default to false
  const [elevator, setElevator] = useState(lastFilterFromStore?.elevator || false);
  const [storage, setStorage] = useState(lastFilterFromStore?.storage || false);

  // Key for re-mounting checkboxes
  const [checkboxKeyPrefix, setCheckboxKeyPrefix] = useState(Date.now());

  // Effect to update local state if lastFilterFromStore changes (e.g. on initial load with a saved filter)
  useEffect(() => {
    if (lastFilterFromStore) {
      setFileType(lastFilterFromStore.file_type || (localStorage.getItem("agents_field") || "sell"));
      setPropertyType(lastFilterFromStore.property_type || "A");
      if (lastFilterFromStore.file_type === 'sell') {
        setPrice(lastFilterFromStore.price__gte || lastFilterFromStore.price || null); // Handle direct price or range
        setPriceUp(null); setPriceRent(null);
      } else {
        setPriceUp(lastFilterFromStore.price_up__gte || lastFilterFromStore.price_up || null);
        setPriceRent(lastFilterFromStore.price_rent__gte || lastFilterFromStore.price_rent || null);
        setPrice(null);
      }
      setM2(lastFilterFromStore.m2__gte || null);
      setBedroom(lastFilterFromStore.bedroom__gte || null);
      setYear(lastFilterFromStore.year__gte || null);
      setParking(lastFilterFromStore.parking || false);
      setElevator(lastFilterFromStore.elevator || false);
      setStorage(lastFilterFromStore.storage || false);
      setCheckboxKeyPrefix(Date.now()); // Ensure checkboxes reflect store on load
    }
  }, [lastFilterFromStore]);


  const getBudgetRange = (basePrice) => {
    if (basePrice === null || basePrice === "" || isNaN(Number(basePrice))) return [null, null];
    const numericPrice = Number(basePrice);
    const lowerBound = Math.floor(numericPrice * 0.75);
    const upperBound = Math.floor(numericPrice * 1.25);
    return (lowerBound === 0 && upperBound === 0 && numericPrice !== 0) ? [null, null] : [lowerBound, upperBound];
  };


  const handleFilterSubmit = useCallback(() => {
    let filterPayload = {
      status: "ACTIVE",
      file_type: fileType,
      property_type: propertyType,
      ...(m2 && { m2__gte: Number(m2) }),
      ...(bedroom && { bedroom__gte: Number(bedroom) }),
      ...(year && { year__gte: Number(year) }),
      // Only add boolean filters if they are true, to avoid sending `parking: false`
      ...(parking && { parking: true }),
      ...(elevator && { elevator: true }),
      ...(storage && { storage: true }),
    };

    if (fileType === "sell") {
      const [priceGte, priceLte] = getBudgetRange(price);
      if (priceGte !== null) filterPayload.price__gte = priceGte;
      if (priceLte !== null) filterPayload.price__lte = priceLte;
    } else if (fileType === "rent") {
      const [upGte, upLte] = getBudgetRange(priceUp);
      const [rentGte, rentLte] = getBudgetRange(priceRent);
      if (upGte !== null) filterPayload.price_up__gte = upGte;
      if (upLte !== null) filterPayload.price_up__lte = upLte;
      if (rentGte !== null) filterPayload.price_rent__gte = rentGte;
      if (rentLte !== null) filterPayload.price_rent__lte = rentLte;
    }
    
    // Clean up undefined or null range values before sending
    Object.keys(filterPayload).forEach(key => {
        if (filterPayload[key] === null || filterPayload[key] === undefined) {
            delete filterPayload[key];
        }
    });


    api.get("listing/", { params: filterPayload })
      .then((response) => {
        dispatch(setFiles(response.data.results));
        dispatch(setLastFilter(filterPayload)); // Save the actual payload sent
      })
      .catch((error) => console.error("Filter API error:", error));
  }, [fileType, propertyType, price, priceUp, priceRent, m2, bedroom, year, parking, elevator, storage, dispatch]);

  const handleCancelFilter = useCallback(() => {
    dispatch(clearLastFilter());
    // Reset local component state
    setFileType(localStorage.getItem("agents_field") || "sell");
    setPropertyType("A");
    setPrice(null); setPriceUp(null); setPriceRent(null);
    setM2(null); setBedroom(null); setYear(null);
    setParking(false); setElevator(false); setStorage(false);
    setCheckboxKeyPrefix(Date.now()); // Force re-mount of checkboxes

    // Fetch initial data (or let Files.jsx handle it based on cleared filter)
    // This part might be redundant if Files.jsx re-fetches on lastFilter change
    api.get("/listing/?page=1", { params: { status: "ACTIVE", file_type: localStorage.getItem("agents_field") || "sell" } })
      .then((response) => {
        dispatch(setFiles(response.data.results));
      })
      .catch((error) => console.error(error));
  }, [dispatch]);

  // Adapt setter for your Checkbox component
  const handleCheckboxChange = (setterFn, currentVal) => {
    // Your Checkbox calls setter((prevState) => (prevState ? null : true))
    // We need to execute this function to get the new value (true or null)
    const newValue = currentVal === null ? true : (currentVal ? null : true);
    setterFn(newValue === null ? false : newValue); // Store as boolean (false if null)
  };


  return (
    <div className="bg-gray-50 p-4 sm:p-6 rounded-xl shadow-lg my-6 mx-auto max-w-5xl ">
      <form
        id="filter"
        onSubmit={(e) => { e.preventDefault(); handleFilterSubmit(); }}
        className="space-y-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6 items-end">
          <div>
            <label htmlFor="file_type_filter" className="block text-sm font-medium text-gray-700 mb-1">نوع قرارداد</label>
            <select
              name="file_type_filter"
              id="file_type_filter"
              value={fileType}
              onChange={(e) => setFileType(e.target.value)}
              className={selectClasses}
            >
              <option value="sell">فروش</option>
              <option value="rent">اجاره</option>
            </select>
          </div>
          <div>
            <label htmlFor="property_type_filter" className="block text-sm font-medium text-gray-700 mb-1">نوع ملک</label>
            <select
              name="property_type_filter"
              id="property_type_filter"
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              className={selectClasses}
            >
              <option value="A">آپارتمان</option>
              <option value="L">زمین</option>
              <option value="S">مغازه</option>
              <option value="H">خانه و ویلا</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-8">
          {fileType === "sell" ? (
            <FloatLabel label="قیمت مدنظر (تومان)" name="price_filter" type="number" setter={setPrice} />
          ) : (
            <>
              <FloatLabel label="ودیعه مدنظر (تومان)" name="price_up_filter" type="number" setter={setPriceUp} />
              <FloatLabel label="اجاره مدنظر (تومان)" name="price_rent_filter" type="number" setter={setPriceRent} />
            </>
          )}
          <FloatLabel label="متراژ (حداقل متر مربع)" name="m2_filter" type="number" value={m2 || ""} setter={setM2} />
          
          {propertyType !== "L" && ( // Not for زمین
            <FloatLabel label="سال ساخت (حداقل)" name="year_filter" type="number" value={year || ""} setter={setYear} />
          )}
          {(propertyType === "A" || propertyType === "H") && ( // Only for آپارتمان & خانه و ویلا
            <FloatLabel label="تعداد اتاق خواب (حداقل)" name="bedroom_filter" type="number" value={bedroom || ""} setter={setBedroom} />
          )}
        </div>

        {propertyType !== "L" && ( // Amenities not for "زمین"
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">امکانات:</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1">
              <Checkbox
                key={`parking-filter-${checkboxKeyPrefix}`}
                label="پارکینگ"
                name="parking_filter"
                isChecked={Boolean(parking)} // Pass boolean
                setter={(updaterFn) => handleCheckboxChange(setParking, parking)}
              />
              <Checkbox
                key={`elevator-filter-${checkboxKeyPrefix}`}
                label="آسانسور"
                name="elevator_filter"
                isChecked={Boolean(elevator)}
                setter={(updaterFn) => handleCheckboxChange(setElevator, elevator)}
              />
              <Checkbox
                key={`storage-filter-${checkboxKeyPrefix}`}
                label="انباری"
                name="storage_filter"
                isChecked={Boolean(storage)}
                setter={(updaterFn) => handleCheckboxChange(setStorage, storage)}
              />
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-4 border-t border-gray-200">
          {lastFilterFromStore && (
            <button
              type="button"
              onClick={handleCancelFilter}
              className="w-full sm:w-auto px-6 py-2.5 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              حذف فیلتر
            </button>
          )}
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 text-sm font-medium rounded-lg text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            اعمال فیلتر
          </button>
        </div>
      </form>
    </div>
  );
};

export default Filter;
