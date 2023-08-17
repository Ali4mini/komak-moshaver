import { useState } from "react";
import FloatLabel from "../common/input";
import Checkbox from "../common/checkbox";
import api from "../common/api";
import { useDispatch } from "react-redux";
import { setCustomers } from "./customersSlice";

const Filter = () => {
  const [customerType, setCustomerType] = useState(
    localStorage.getItem("agents_field") === "sell" ? "buy" : "rent"
  );
  const [propertyType, setPropertyType] = useState("A");
  const [budget, setBudget] = useState(null);
  const [up_budget, setUpBudget] = useState(null);
  const [rent_budget, setRentBudget] = useState(null);
  const [m2, setM2] = useState(null);
  const [bedroom, setBedroom] = useState(null);
  const [year, setYear] = useState(null);
  const [parking, setParking] = useState(null);
  const [elevator, setElevator] = useState(null);
  const [storage, setStorage] = useState(null);
  const dispatch = useDispatch();

  const filter_entery = {
    customer_type: customerType,
    property_type: propertyType,
    budget__gte: budget,
    up_budget__gte: up_budget,
    rent_budget__gte: rent_budget,
    m2__lte: m2,
    bedroom__lte: bedroom,
    year__lte: year,
    parking: parking,
    elevator: elevator,
    storage: storage,
  };

  const filter = (data) => {
    if (data.cusotmer_type === "buy") {
      delete data.up_budget__lte;
      delete data.rent_budget__lte;
    } else if (data.customer_type === "rent") {
      delete data.budget__lte;
    }

    api
      .get("listing/customers/", { params: data })
      .then((response) => {
        dispatch(setCustomers(response.data));
      })
      .catch((error) => console.log(`error: ${error}`));
  };

  return (
    <div
      id="filter"
      className="flex flex-col border-2 rounded-xl mx-4 p-3 h-auto gap-5 shadow"
    >
      <div className="flex basis-full gap-5">
        <select
          name="customer_type"
          id="customer_type"
          defaultValue={customerType}
          onChange={(e) => {
            setCustomerType(e.target.value);
          }}
          className="bg-gray-50 border focus:ring-blue-300 text-center focus:border-blue-300 shadow-md w-32 h-10 rounded-lg"
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
          className="bg-gray-50 border focus:ring-blue-300 text-center focus:border-blue-300 shadow-md  w-32 h-10 rounded-lg"
        >
          <option value="A">آپارتمان</option>
          <option value="L">زمین</option>
          <option value="S">مغازه</option>
          <option value="H">خانه و ویلا</option>
        </select>
      </div>
      <div className="flex basis-full gap-3">
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
              name="price_up"
              type="number"
              setter={setUpBudget}
            />
            <FloatLabel
              label="اجاره"
              name="price_rent"
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
      <div className="flex basis-full gap-5">
        <Checkbox label="پارکینگ" name="parking" setter={setParking} />
        <Checkbox label="آسانسور" name="elevator" setter={setElevator} />
        <Checkbox label="انباری" name="storage" setter={setStorage} />
      </div>
      <button
        onClick={() => filter(filter_entery)}
        className="basis-full rounded-lg bg-blue-300 hover:bg-blue-400 py-1 border w-full bottom-0"
      >
        فیلتر
      </button>
    </div>
  );
};

export default Filter;
