import FloatLabel from "../common/input";
import Checkbox from "../common/checkbox";
import { useEffect, useState } from "react";
import api from "../common/api";
import { useNavigate, useParams } from "react-router-dom";

const UpdateCustomer = () => {
  const { customerType, id } = useParams();
  const [oldCustomer, setOldCustomer] = useState(null);

  useEffect(() => {
    api
      .get(`customer/${customerType}/${id}/`)
      .then((response) => {
        setOldCustomer(response.data);
      })
      .catch((error) => console.log(error.data));
  }, []);

  const [propertyType, setPropertyType] = useState(
    oldCustomer ? oldCustomer.property_type : ""
  );
  const [m2, setM2] = useState(oldCustomer ? oldCustomer.m2 : "");
  const [year, setYear] = useState(oldCustomer ? oldCustomer.year : "");
  const [bedroom, setBedroom] = useState(oldCustomer ? oldCustomer.bedroom : "");
  const [budget, setbudget] = useState(oldCustomer ? oldCustomer.budget : "");
  const [upBudget, setUpBudget] = useState(oldCustomer ? oldCustomer.up_budget : "");
  const [rentbudget, setRentBudget] = useState(oldCustomer ? oldCustomer.rent_budget : "");
  const [units, setUnits] = useState(oldCustomer ? oldCustomer.vahedha : "");
  const [parking, setParking] = useState(oldCustomer ? oldCustomer.parking : "");
  const [elevator, setElevator] = useState(oldCustomer ? oldCustomer.elevator : "");
  const [storage, setStorage] = useState(oldCustomer ? oldCustomer.storage : "");
  const [motorSpot, setMotorSpot] = useState(
    oldCustomer ? oldCustomer.parking_motor : ""
  );
  const [customerName, setCustomerName] = useState(oldCustomer ? oldCustomer.customer_name : "");
  const [customerPhone, setCustomerPhone] = useState(
    oldCustomer ? oldCustomer.customer_phone : ""
  );

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

  const update = (updatedFile) => {
    console.log(updatedEntery);
    api
      .patch(`customer/${customerType}/${id}/`, updatedFile)
      .then(navigate("/", { replace: true }))
      .catch((error) => console.log(error.data));
  };

  if (oldCustomer) {
    return (
      <div className="block border shadow-lg rounded-xl bg-white mx-4 px-4 py-2 my-2">
        <div className="flex flex-col gap-5">
          <div className="flex basis-full flex-row gap-2">
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
          
          <div className="grid md:grid-cols-6 w-full flex-wrap gap-2">
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
                  defValue={oldCustomer.upBudget}
                  type="number"
                  name={"upBudget"}
                  label={"ودیعه"}
                  setter={setUpBudget}
                  isRequired={true}
                />
                <FloatLabel
                  defValue={oldCustomer.rentbudget}
                  type="number"
                  name={"rentbudget"}
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
              isRequired={true}
            />
            <FloatLabel
              defValue={oldCustomer.year}
              type="number"
              name={"year"}
              label={"سال ساخت"}
              setter={setYear}
              isRequired={true}
            />
            <FloatLabel
              defValue={oldCustomer.bedroom}
              type="number"
              name={"bedroom"}
              label={"اتاق خواب"}
              setter={setBedroom}
              isRequired={true}
            />
            <FloatLabel
              defValue={oldCustomer.vahedha}
              type="number"
              name={"units"}
              label={"واحد ها"}
              setter={setUnits}
              isRequired={true}
            />
          </div>
          <div className="flex basis-full flex-row gap-2">
            <FloatLabel
              defValue={oldCustomer.customer_phone}
              type="text"
              name={"customerPhone"}
              label={"شماره مالک"}
              setter={setCustomerPhone}
              isRequired={true}
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
          <div className="flex basis-full gap-5">
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
            onClick={() => update(updatedEntery)}
            className="basis-full rounded-lg bg-blue-300 hover:bg-blue-400 py-1.5 border w-full bottom-0"
          >
            ثبت
          </button>
        </div>
      </div>
    );
  }
};

export default UpdateCustomer;
