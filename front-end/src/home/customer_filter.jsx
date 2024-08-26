import { useState } from "react";
import FloatLabel from "../common/input";
import Checkbox from "../common/checkbox";
import api from "../common/api";
import { useDispatch, useSelector } from "react-redux";
import { setCustomers, setLastFilter, clearLastFilter, addCustomers } from "./customersSlice";
import { useEffect } from "react";

const Filter = () => {
  const [customerType, setCustomerType] = useState(
    localStorage.getItem("agents_field") === "sell" ? "buy" : "rent"
  );
  const store = useSelector((state) => state.customers);
  let lastFilter = store.lastFilter;
  const [propertyType, setPropertyType] = useState("A");
  const [budget, setBudget] = useState(null);
  const [budgetUp, setUpBudget] = useState(null);
  const [budgetRent, setRentBudget] = useState(null);
  const [m2, setM2] = useState(null);
  const [bedroom, setBedroom] = useState(null);
  const [year, setYear] = useState(null);
  const [parking, setParking] = useState(null);
  const [elevator, setElevator] = useState(null);
  const [storage, setStorage] = useState(null);
  const dispatch = useDispatch();
  const [budgetRange, setBudgetRange] = useState([null, null]);
  const [budgetUpRange, setBudgetUpRange] = useState([null, null]);
  const [budgetRentRange, setBudgetRentRange] = useState([null, null]);

  // filter range
  useEffect(() => {
    // sell filter budget range
    if (customerType === "buy") {
      let lowerBound = Math.floor(budget * 0.8);
      let upperBound = Math.floor(budget * 1.2);

      if (lowerBound === 0 && upperBound === 0) {
        setBudgetRange([null, null]);
      } else {
        setBudgetRange([lowerBound, upperBound]);
        console.log(budgetRange)
      }


      console.log(budgetRange);
    }

    if (budgetUp === null) {
      setBudgetUpRange([null, null]);
    }
    // rent filter budget range
    else if (customerType === "rent") {
      let lowerBound = Math.floor(budgetUp * 0.8);
      let upperBound = Math.floor(budgetUp * 1.2);

      if (lowerBound === 0 && upperBound === 0) {
        setBudgetUpRange([null, null]);
      } else {
        setBudgetUpRange([lowerBound, upperBound]);
      }


      if (budgetRent === null) {
        setBudgetRentRange([null, null]);
      } else {
        let lowerBoundRent = Math.floor(budgetRent * 0.7);
        let upperBoundRent = Math.floor(budgetRent * 1.3);

        if (lowerBoundRent === 0 && upperBoundRent === 0) {
          setBudgetRentRange([null, null]);
        } else {
          setBudgetRentRange([lowerBoundRent, upperBoundRent]);
        }
      }
    }
  }, [customerType, budget, budgetUp, budgetRent]);

  // note: there is a list of allowed fields that you can filter in listing api
  console.log(budgetUpRange);
  const filter_entery = {
    status: "ACTIVE",
    customer_type: customerType,
    property_type: propertyType,
    budget__gte: budgetRange[0],
    budget__lte: budgetRange[1],
    up_budget__gte: budgetUpRange[0],
    up_budget__lte: budgetUpRange[1],
    rent_budget__gte: budgetRentRange[0],
    rent_budget__lte: budgetRentRange[1],
    m2__lte: m2,
    bedroom__lte: bedroom,
    year__lte: year,
    parking: parking,
    elevator: elevator,
    storage: storage,
  };

  const filter = (data) => {
    if (data.cusotmer_type === "buy") {
      delete data.budgetUp__lte;
      delete data.budgetRent__lte;
    } else if (data.customer_type === "rent") {
      delete data.budget__lte;
    }

    api
      .get("listing/customers/", { params: data })
      .then((response) => {
        dispatch(setCustomers(response.data.results));
        dispatch(setLastFilter(data));
      })
      .catch((error) => console.log(`error: ${error}`));
  };

  const cancelFilter = () => {
    // Resetting the Redux state
    dispatch(clearLastFilter());

    // Fetching the initial data without filters applied
    api.get("/listing/customers/?page=1", { params: { status: "ACTIVE", file_type: localStorage.getItem("agents_field") } })
      .then((response) => {
        if (response.data.previous === null) {
          dispatch(setCustomers(response.data.results));
        } else if (response.data.next) {
          dispatch(addCustomers(response.data.results));
        }
      })
      .catch((error) => console.error(error));

    // Resetting local component state
    setCustomerType(localStorage.getItem("agents_field"));
    setPropertyType("A"); // Assuming 'null' is an acceptable initial value for propertyType
    setBudget(null);
    setUpBudget(null);
    setRentBudget(null);
    setM2(null);
    setBedroom(null);
    setYear(null);
    setParking(null);
    setElevator(null);
    setStorage(null);
    setBudgetRange([null, null]); // Resetting budget ranges
    setBudgetUpRange([null, null]);
    setBudgetRentRange([null, null]);
  }

  return (
    <div
      id="filter"
      className="flex flex-col border-2 rounded-xl mx-4 p-3 h-auto gap-5 shadow"
    >
      <div className="grid grid-cols-3 h-10 max-w-xs">
        <select
          name="customer_type"
          id="customer_type"
          value={customerType}
          onChange={(e) => {
            setCustomerType(e.target.value);
          }}
          className="bg-gray-50 border focus:ring-blue-300 text-center focus:border-blue-300 shadow-md w-24 rounded-lg"
        >
          <option id="buy" value="buy">
            خرید
          </option>

          <option id="rent" value="rent">
            اجاره
          </option>
        </select>
        <select
          name="property_type"
          id="property_type"
          value={propertyType}
          onChange={(e) => {
            setPropertyType(e.target.value);
          }}
          className="bg-gray-50 border focus:ring-blue-300 text-center focus:border-blue-300 shadow-md w-24 rounded-lg"
        >
          <option value="A">آپارتمان</option>
          <option value="L">زمین</option>
          <option value="S">مغازه</option>
          <option value="H">خانه و ویلا</option>
        </select>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 basis-full gap-3">
        {customerType === "buy" ? (
          <FloatLabel
            label="بودچه"
            name="budget"
            type="number"
            setter={setBudget}
          />
        ) : (
          <>
            <FloatLabel
              label="ودیعه"
              name="budget_up"
              type="number"
              setter={setUpBudget}
            />
            <FloatLabel
              label="اجاره"
              name="budget_rent"
              type="number"
              setter={setRentBudget}
            />
          </>
        )}
        <FloatLabel label="متراژ" name="m2" type="number" setter={setM2} />
        <FloatLabel
          label="اتاق خواب"
          name="bedroom"
          type="number"
          setter={setBedroom}
        />
        <FloatLabel
          label="سال ساخت"
          name="year"
          type="number"
          setter={setYear}
        />
      </div>
      <div className="grid grid-cols-3 max-w-xs">
        <Checkbox label="پارکینگ" name="parking" setter={setParking} />
        <Checkbox label="آسانسور" name="elevator" setter={setElevator} />
        <Checkbox label="انباری" name="storage" setter={setStorage} />
      </div>
      {lastFilter ? (
        <button
          onClick={() => cancelFilter()}
          className="basis-full rounded-lg bg-red-300 hover:bg-red-400 py-1 border w-full bottom-0"
        >
          حذف فیلتر
        </button>
      ) :

        <button
          onClick={() => filter(filter_entery)}
          className="basis-full rounded-lg bg-blue-300 hover:bg-blue-400 py-1 border w-full bottom-0"
        >
          فیلتر
        </button>
      }
    </div>
  );
};

export default Filter;
