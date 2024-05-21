import { useState } from "react";
import FloatLabel from "../common/input";
import Checkbox from "../common/checkbox";
import api from "../common/api";
import { useDispatch, useSelector } from "react-redux";
import { setCustomers, setLastFilter, clearLastFilter } from "./customersSlice";

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
  let budgetRange = [],
    budgetUpRange = [],
    budgetRentRange = [];

  // filter range
  if (budget) {
    if (budget <= 3000) {
      budgetRange = [Math.floor(budget * 0.8), Math.floor(budget * 1.2)];
    } else if (budget > 3000 && budget < 5000) {
      budgetRange = [Math.floor(budget * 0.85), Math.floor(budget * 1.15)];
    } else if (budget >= 5000) {
      budgetRange = [Math.floor(budget * 0.9), Math.floor(budget * 1.1)];
    }
  } else {
    if (budgetUp <= 300) {
      budgetUpRange = [Math.floor(budgetUp * 0.8), Math.floor(budgetUp * 1.2)];
    } else if (budgetUp > 300 && budgetUp < 700) {
      budgetUpRange = [
        Math.floor(budgetUp * 0.85),
        Math.floor(budgetUp * 1.15),
      ];
    } else if (budgetUp >= 700) {
      budgetUpRange = [Math.floor(budgetUp * 0.9), Math.floor(budgetUp * 1.1)];
    }

    if (budgetRent <= 3) {
      budgetRentRange = [
        Math.floor(budgetRent * 0.7),
        Math.floor(budgetRent * 1.3),
      ];
    } else if (budgetRent > 3 && budgetRent < 7) {
      budgetRentRange = [
        Math.floor(budgetRent * 0.8),
        Math.floor(budgetRent * 1.2),
      ];
    } else if (budgetRent >= 7) {
      budgetRentRange = [
        Math.floor(budgetRent * 0.85),
        Math.floor(budgetRent * 1.15),
      ];
    }
  }

  // note: there is a list of allowed fields that you can filter in listing api
  console.log(budgetRange);
  const filter_entery = {
    status: "ACTIVE",
    customer_type: customerType,
    property_type: propertyType,
    budget__gte: budgetRange[0],
    budget__lte: budgetRange[1],
    budgetUp__gte: budgetUpRange[0],
    budgetUp__lte: budgetUpRange[1],
    budgetRent__gte: budgetRentRange[0],
    budgetRent__lte: budgetRentRange[1],
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
    dispatch(clearLastFilter());
    location.reload();
  };

  return (
    <div
      id="filter"
      className="flex flex-col border-2 rounded-xl mx-4 p-3 h-auto gap-5 shadow"
    >
      <div className="grid grid-cols-3 h-10 max-w-xs">
        <select
          name="customer_type"
          id="customer_type"
          defaultValue={customerType}
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
