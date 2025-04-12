import FloatLabel from "../common/input";
import Checkbox from "../common/checkbox";
import { useEffect, useState } from "react";
import { api } from "../common/api";
import { useNavigate, useParams } from "react-router-dom";
import CustomDatePicker from "../common/datePicker";

const UpdateCustomer = () => {
  const { customerType, id } = useParams();
  const [oldCustomer, setOldCustomer] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get(`customer/${customerType}/${id}/`);
        setOldCustomer(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        // Optionally set an error state here
      }
    };
    fetchData();
  }, [customerType, id]);

  const [propertyType, setPropertyType] = useState(
    oldCustomer ? oldCustomer.property_type : ""
  );
  const [m2, setM2] = useState(oldCustomer ? oldCustomer.m2 : "");
  const [year, setYear] = useState(oldCustomer ? oldCustomer.year : "");
  const [bedroom, setBedroom] = useState(
    oldCustomer ? oldCustomer.bedroom : ""
  );
  const [budget, setbudget] = useState(oldCustomer ? oldCustomer.budget : "");
  const [upBudget, setUpBudget] = useState(
    oldCustomer ? oldCustomer.up_budget : ""
  );
  const [rentbudget, setRentBudget] = useState(
    oldCustomer ? oldCustomer.rent_budget : ""
  );
  const [units, setUnits] = useState(oldCustomer ? oldCustomer.vahedha : "");
  const [parking, setParking] = useState(
    oldCustomer ? oldCustomer.parking : ""
  );
  const [elevator, setElevator] = useState(
    oldCustomer ? oldCustomer.elevator : ""
  );
  const [storage, setStorage] = useState(
    oldCustomer ? oldCustomer.storage : ""
  );
  const [motorSpot, setMotorSpot] = useState(
    oldCustomer ? oldCustomer.parking_motor : ""
  );
  const [customerName, setCustomerName] = useState(
    oldCustomer ? oldCustomer.customer_name : ""
  );
  const [customerPhone, setCustomerPhone] = useState(
    oldCustomer ? oldCustomer.customer_phone : ""
  );
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const navigate = useNavigate();

  let updatedEntery = {
    customer_type: customerType,
    property_type: propertyType,
    m2: m2,
    year: year,
    bedroom: bedroom,
    budget: budget,
    up_budget: upBudget,
    rent_budget: rentbudget,
    vahedha: units,
    parking: parking,
    elevator: elevator,
    storage: storage,
    parking_motor: motorSpot,
    customer_name: customerName,
    customer_phone: customerPhone,
    date: date,

  };

  useEffect(() => {
    if (oldCustomer) {
      setPropertyType(oldCustomer.property_type);
      setM2(oldCustomer.m2);
      setYear(oldCustomer.year);
      setBedroom(oldCustomer.bedroom);
      setbudget(oldCustomer.budget);
      setUpBudget(oldCustomer.up_budget);
      setRentBudget(oldCustomer.rent_budget);
      setUnits(oldCustomer.vahedha);
      setParking(oldCustomer.parking);
      setElevator(oldCustomer.elevator);
      setStorage(oldCustomer.storage);
      setMotorSpot(oldCustomer.parking_motor);
      setCustomerName(oldCustomer.customer_name);
      setCustomerPhone(oldCustomer.customer_phone);
    }
  }, [oldCustomer]);

  const update = (updatedFile, event) => {
    event.preventDefault();

    if (customerPhone.length !== 11) {
      alert("شماره تلفن باید ۱۱ رقم باشد");
      return; // Stop submission if validation fails
    }
    api
      .patch(`customer/${customerType}/${id}/`, updatedFile)
      .then(navigate(`/customer/${customerType}/${id}/`, { replace: true }))
      .catch((error) => console.log(error.data));
  };

  if (oldCustomer) {
    return (
      <div className="block border shadow-lg rounded-xl bg-white mx-4 px-4 py-2 my-2">
        <form
          className="flex flex-col gap-5 text-sm md:text-base"
        >
          <div className="flex w-full justify-between h-10 gap-2">
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

            <div className="flex flex-row gap-2 left-0">

              <p className="font-bold text-center justify-center items-center">تاریخ: </p>
              <div className="" style={{ direction: "rtl" }}>
                <CustomDatePicker setter={setDate} defaultDate={oldCustomer.customer_date} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-y-4 gap-x-2 md:grid-cols-4 lg:grid-cols-7 w-full flex-wrap">
            {customerType === "buy" ? (
              <FloatLabel
                defValue={oldCustomer.budget}
                type="number"
                name={"budget"}
                label={"قیمت"}
                setter={setbudget}
                isRequired={true}
              />
            ) : (
              <>
                <FloatLabel
                  defValue={oldCustomer.up_budget}
                  type="number"
                  name={"upBudget"}
                  label={"ودیعه"}
                  setter={setUpBudget}
                  isRequired={true}
                />
                <FloatLabel
                  defValue={oldCustomer.rent_budget}
                  type="number"
                  name={"rentBudget"}
                  label={"اجاره"}
                  setter={setRentBudget}
                  isRequired={true}
                />
              </>
            )}

            <FloatLabel
              defValue={oldCustomer.m2}
              type="number"
              name={"m2"}
              label={"متراژ"}
              setter={setM2}
              isRequired={false}
            />
            <FloatLabel
              defValue={oldCustomer.year}
              type="number"
              name={"year"}
              label={"ساخت"}
              setter={setYear}
              isRequired={false}
            />
            <FloatLabel
              defValue={oldCustomer.bedroom}
              type="number"
              name={"bedroom"}
              label={"خواب"}
              setter={setBedroom}
              isRequired={false}
            />
            <FloatLabel
              defValue={oldCustomer.vahedha}
              type="number"
              name={"units"}
              label={"واحد ها"}
              setter={setUnits}
              isRequired={false}
            />
          </div>
          <div className="grid grid-cols-2 max-w-sm gap-2">
            <FloatLabel
              defValue={oldCustomer.customer_phone}
              type="text"
              name={"customerPhone"}
              label={"شماره مالک"}
              setter={setCustomerPhone}
              isRequired={true}
              maxChars={11}
            />
            <FloatLabel
              defValue={oldCustomer.customer_name}
              type="text"
              name={"customerName"}
              label={"نام مالک"}
              setter={setCustomerName}
              isRequired={true}
            />
          </div>
          <div className="grid grid-cols-3 md:grid-cols-4 max-w-sm gap-y-1">
            <Checkbox
              label="پارکینگ"
              name="parking"
              setter={setParking}
              isChecked={oldCustomer.parking}
            />
            <Checkbox
              label="آسانسور"
              name="elevator"
              setter={setElevator}
              isChecked={oldCustomer.elevator}
            />
            <Checkbox
              label="انباری"
              name="storage"
              setter={setStorage}
              isChecked={oldCustomer.storage}
            />
            <Checkbox
              label="پارک موتور"
              name="motorSpot"
              setter={setMotorSpot}
              isChecked={oldCustomer.parking_motor}
            />
          </div>
          <button
            type="submit"
            onClick={(e) => update(updatedEntery, e)} // Move the onClick here
            className="basis-full rounded-lg bg-blue-300 hover:bg-blue-400 py-1.5 border w-full bottom-0"
          >
            ثبت
          </button>
        </form>
      </div>
    );
  }
};

export default UpdateCustomer;
