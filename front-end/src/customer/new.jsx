import FloatLabel from "../common/input";
import Checkbox from "../common/checkbox";
import { useState } from "react";
import api from "../common/api";
import { useNavigate } from "react-router-dom";

const NewCustomer = () => {
  const [customerType, setcustomerType] = useState(
    localStorage.getItem("agents_field")
  );
  const [propertyType, setPropertyType] = useState("A");
  const [m2, setM2] = useState(null);
  const [year, setYear] = useState(null);
  const [bedroom, setBedroom] = useState(null);
  const [budget, setBudget] = useState(null);
  const [upBudget, setUpBudget] = useState(null);
  const [rentBudget, setRentBudget] = useState(null);
  const [units, setUnits] = useState(null);
  const [parking, setParking] = useState(false);
  const [elevator, setElevator] = useState(false);
  const [storage, setStorage] = useState(false);
  const [motorSpot, setMotorSpot] = useState(false);
  const [customerName, setCustomerName] = useState(null);
  const [customerPhone, setCustomerPhone] = useState(null);
  const user = localStorage.getItem("user_id");

  const navigate = useNavigate();

  let customerEntery = {
    added_by: user,
    customer_type: customerType === "sell" ? "buy" : "rent",
    property_type: propertyType,
    m2: m2,
    year: year,
    bedroom: bedroom,
    budget: budget,
    up_budget: upBudget,
    rent_budget: rentBudget,
    vahedha: units,
    parking: parking,
    elevator: elevator,
    storage: storage,
    parking_motor: motorSpot,
    customer_name: customerName,
    customer_phone: customerPhone,
  };

  if (customerType === "buy") {
    delete customerEntery.up_budget;
    delete customerEntery.rent_budget;
  } else if (customerType === "rent") {
    delete customerEntery.budget;
  }

  const create = (customerEntery) => {
    console.log(customerEntery);
    api
      .post(`customer/${customerEntery.customer_type}/new/`, customerEntery)
      .then((response) => console.log(response.data))
      .catch((error) => console.log(error.data));
    navigate("/customers/", { replace: true });
  };
  return (
    <div className="block border shadow-lg rounded-xl bg-white mx-4 px-4 py-2 my-2">
      <div className="flex flex-col gap-5">
        <div className="flex basis-full flex-row gap-2">
          <select
            name="customer_type"
            id="customer_type"
            defaultValue={customerType}
            onChange={(e) => {
              setcustomerType(e.target.value);
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
        <div className="flex w-full flex-wrap gap-2">
          {customerType === "buy" ? (
            <FloatLabel
              type="number"
              name={"budget"}
              label={"بودچه"}
              setter={setBudget}
              isRequired={true}
            />
          ) : (
            <>
              <FloatLabel
                type="number"
                name={"upPrice"}
                label={"ودیعه"}
                setter={setUpBudget}
                isRequired={true}
              />
              <FloatLabel
                type="number"
                name={"rentPrice"}
                label={"اجاره"}
                setter={setRentBudget}
                isRequired={true}
              />
            </>
          )}

          <FloatLabel
            type="number"
            name={"m2"}
            label={"متراژ"}
            setter={setM2}
            isRequired={true}
          />
          <FloatLabel
            type="number"
            name={"year"}
            label={"سال ساخت"}
            setter={setYear}
            isRequired={true}
          />
          <FloatLabel
            type="number"
            name={"bedroom"}
            label={"اتاق خواب"}
            setter={setBedroom}
            isRequired={true}
          />

          <FloatLabel
            type="number"
            name={"units"}
            label={"واحد ها"}
            setter={setUnits}
            isRequired={true}
          />
        </div>
        <div className="flex basis-full flex-row gap-2">
          <FloatLabel
            type="text"
            name={"customerPhone"}
            label={"شماره مشتری"}
            setter={setCustomerPhone}
            isRequired={true}
          />
          <FloatLabel
            type="text"
            name={"customerName"}
            label={"نام مشتری"}
            setter={setCustomerName}
            isRequired={true}
          />
        </div>
        <div className="flex basis-full gap-5">
          <Checkbox label="پارکینگ" name="parking" setter={setParking} />
          <Checkbox label="آسانسور" name="elevator" setter={setElevator} />
          <Checkbox label="انباری" name="storage" setter={setStorage} />
          <Checkbox label="پارک موتور" name="motorSpot" setter={setMotorSpot} />
        </div>
        <button
          onClick={() => create(customerEntery)}
          className="basis-full rounded-lg bg-blue-300 hover:bg-blue-400 py-1.5 border w-full bottom-0"
        >
          ثبت
        </button>
      </div>
    </div>
  );
};

export default NewCustomer;
