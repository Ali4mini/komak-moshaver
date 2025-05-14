import FloatLabel from "../common/input";
import Checkbox from "../common/checkbox";
import { useState, useEffect } from "react"; // Added useEffect
import { api } from "../common/api";
// import { useNavigate } from "react-router-dom"; // No longer needed for navigation on submit
import { useDispatch } from "react-redux";
import { setFlashMessage } from "../common/flashSlice";
import CustomDatePicker from "../common/datePicker";

const NewCustomer = () => {
  const getInitialCustomerType = () => {
    return (localStorage.getItem("agents_field") || "sell").toLowerCase() === "sell" ? "buy" : "rent";
  };
  const initialDate = new Date().toISOString().split("T")[0];

  const [customerType, setCustomerType] = useState(getInitialCustomerType());
  const [propertyType, setPropertyType] = useState("A");
  const [m2, setM2] = useState(""); // Initialized to empty string
  const [year, setYear] = useState(""); // Initialized to empty string
  const [bedroom, setBedroom] = useState(""); // Initialized to empty string
  const [budget, setBudget] = useState(""); // Initialized to empty string
  const [upBudget, setUpBudget] = useState(""); // Initialized to empty string
  const [rentBudget, setRentBudget] = useState(""); // Initialized to empty string
  const [units, setUnits] = useState(""); // Initialized to empty string (if applicable based on property type)
  const [parking, setParking] = useState(false);
  const [elevator, setElevator] = useState(false);
  const [storage, setStorage] = useState(false);
  const [motorSpot, setMotorSpot] = useState(false);
  const [customerName, setCustomerName] = useState(""); // Initialized to empty string
  const [customerPhone, setCustomerPhone] = useState(""); // Initialized to empty string
  const [description, setDescription] = useState(""); // Initialized to empty string
  const [date, setDate] = useState(initialDate);

  const user = localStorage.getItem("user");
  // const navigate = useNavigate(); // No longer needed
  const dispatch = useDispatch();

  const resetForm = () => {
    setCustomerType(getInitialCustomerType());
    setPropertyType("A");
    setM2("");
    setYear("");
    setBedroom("");
    setBudget("");
    setUpBudget("");
    setRentBudget("");
    setUnits("");
    setParking(false);
    setElevator(false);
    setStorage(false);
    setMotorSpot(false);
    setCustomerName("");
    setCustomerPhone("");
    setDescription("");
    setDate(new Date().toISOString().split("T")[0]);
  };

  // Effect to clear irrelevant budget fields when customerType changes
  useEffect(() => {
    if (customerType === "buy") {
      setUpBudget("");
      setRentBudget("");
    } else if (customerType === "rent") {
      setBudget("");
    }
  }, [customerType]);

  const create = async (event) => { // Made async
    event.preventDefault();

    // Construct customerEnteryData inside the submit handler
    let customerEnteryData = {
      username: user,
      customer_type: customerType,
      property_type: propertyType,
      date: date,
      updated: date, // Assuming 'updated' should also be the current submission date
      m2: m2 ? Number(m2) : null,
      year: year ? Number(year) : null,
      bedroom: bedroom ? Number(bedroom) : null,
      budget: budget ? Number(budget) : null,
      up_budget: upBudget ? Number(upBudget) : null,
      rent_budget: rentBudget ? Number(rentBudget) : null,
      vahedha: units ? Number(units) : null,
      parking: parking,
      elevator: elevator,
      storage: storage,
      parking_motor: motorSpot,
      customer_name: customerName,
      customer_phone: customerPhone,
      description: description || null,
    };

    if (customerType === "buy") {
      delete customerEnteryData.up_budget;
      delete customerEnteryData.rent_budget;
      if (!customerEnteryData.budget) {
        alert("بودجه برای مشتری خرید الزامی است.");
        return;
      }
    } else if (customerType === "rent") {
      delete customerEnteryData.budget;
      if (!customerEnteryData.up_budget || !customerEnteryData.rent_budget) {
        alert("ودیعه و اجاره برای مشتری رهن/اجاره الزامی است.");
        return;
      }
    }

    // Validation
    if (!customerPhone || customerPhone.length !== 11) {
      alert("شماره تلفن مشتری الزامی و باید ۱۱ رقم باشد.");
      return;
    }
    if (!customerName) {
      alert("نام مشتری الزامی است.");
      return;
    }

    try {
      const response = await api.post(`customer/${customerEnteryData.customer_type}/new/`, customerEnteryData);
      if (response.status === 201) {
        dispatch(
          setFlashMessage({
            type: "SUCCESS",
            message: `یک مشتری با موفقیت اضافه شد \n کد: ${response.data["id"]}`,
          })
        );
        resetForm(); // Reset form on success
      } else {
        // Handle other non-201 success statuses if necessary
        console.warn("Customer creation returned status:", response.status, response.data);
        dispatch(
          setFlashMessage({
            type: "WARNING",
            message: `مشتری ثبت شد اما با وضعیت غیرمنتظره: ${response.status}`,
          })
        );
        resetForm(); // Optionally reset
      }
    } catch (error) {
      console.error("Customer creation error:", error.response ? error.response.data : error.message);
      const errorMessage = error.response?.data?.detail ||
                           (error.response?.data && typeof error.response.data === 'object' ? JSON.stringify(error.response.data) : null) ||
                           error.message ||
                           'خطا در ثبت مشتری. لطفا دوباره تلاش کنید.';
      dispatch(
        setFlashMessage({
          type: "ERROR",
          message: errorMessage,
        })
      );
      // Do not reset form on error
    }
    // navigate("/customers/", { replace: true }); // REMOVED
  };

  return (
    <div className="block border shadow-lg rounded-xl bg-white mx-4 px-4 py-2 my-2">
      <form
        onSubmit={create} // Pass function reference
        className="flex flex-col gap-5 text-sm md:text-base"
      >
        <div className="flex flex-row w-full justify-between h-10 items-center gap-2"> {/* Added items-center */}
          <div className="flex gap-2 h-10 right-0">
            <select
              name="customer_type"
              id="customer_type"
              value={customerType} // Controlled component
              onChange={(e) => {
                setCustomerType(e.target.value);
              }}
              className="bg-gray-50 border focus:ring-blue-300 text-center focus:border-blue-300 shadow-md w-24 rounded-lg"
            >
              <option value="buy">خرید</option>
              <option value="rent">اجاره</option>
            </select>

            <select
              name="property_type"
              id="property_type"
              value={propertyType} // Controlled component
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
          <div className="flex flex-row gap-3 left-0 items-center"> {/* Added items-center */}
            <p className="font-bold text-center">تاریخ: </p> {/* Simplified */}
            <div style={{ direction: "rtl" }}>
              <CustomDatePicker date={date} setter={setDate} /> {/* Pass date prop */}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-y-4 gap-x-2 md:grid-cols-4 lg:grid-cols-7 w-full flex-wrap"> {/* Removed gap-2 */}
          {customerType === "buy" ? (
            <FloatLabel
              type="number"
              name={"budget"}
              label={"بودچه"}
              value={budget} // Controlled
              setter={setBudget}
              isRequired={true}
            />
          ) : (
            <>
              <FloatLabel
                type="number"
                name={"upBudget"}
                label={"ودیعه"}
                value={upBudget} // Controlled
                setter={setUpBudget}
                isRequired={true}
              />
              <FloatLabel
                type="number"
                name={"rentBudget"}
                label={"اجاره"}
                value={rentBudget} // Controlled
                setter={setRentBudget}
                isRequired={true}
              />
            </>
          )}

          <FloatLabel
            type="number"
            name={"m2"}
            label={"متراژ (حداقل)"}
            value={m2} // Controlled
            setter={setM2}
            isRequired={false}
          />
          {/* Fields like year, bedroom, units might be less relevant for L (زمین) or S (مغازه)
              Consider conditional rendering based on propertyType if needed */}
          {propertyType !== "L" && ( // Example: Don't show year for 'زمین'
            <FloatLabel
              type="number"
              name={"year"}
              label={"سال ساخت (حداکثر)"}
              value={year} // Controlled
              setter={setYear}
              isRequired={false}
            />
          )}
          {(propertyType === "A" || propertyType === "H") && ( // Only for آپارتمان or خانه
            <FloatLabel
              type="number"
              name={"bedroom"}
              label={"اتاق خواب (حداقل)"}
              value={bedroom} // Controlled
              setter={setBedroom}
              isRequired={false}
            />
          )}
          {propertyType === "A" && ( // Only for آپارتمان
            <FloatLabel
              type="number"
              name={"units"}
              label={"واحد (حداکثر)"}
              value={units} // Controlled
              setter={setUnits}
              isRequired={false}
            />
          )}
        </div>
        <div className="grid grid-cols-2 max-w-sm gap-2">
          <FloatLabel
            type="tel" // Use tel for phone numbers
            name={"customerPhone"}
            label={"شماره مشتری"}
            value={customerPhone} // Controlled
            setter={setCustomerPhone}
            isRequired={true}
            maxChars={11}
          />
          <FloatLabel
            type="text"
            name={"customerName"}
            label={"نام مشتری"}
            value={customerName} // Controlled
            setter={setCustomerName}
            isRequired={true}
          />
        </div>
        <div className="grid grid-cols-1 h-12 gap-2"> {/* Changed to grid-cols-1 for full width */}
          <FloatLabel
            type="text"
            name={"description"}
            label={"توضیحات"}
            value={description} // Controlled
            setter={setDescription}
            isRequired={false}
          />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 max-w-md gap-y-1 gap-x-2"> {/* Adjusted grid */}
          <Checkbox label="پارکینگ" name="parking" checked={parking} setter={setParking} />
          <Checkbox label="آسانسور" name="elevator" checked={elevator} setter={setElevator} />
          <Checkbox label="انباری" name="storage" checked={storage} setter={setStorage} />
          <Checkbox label="پارک موتور" name="motorSpot" checked={motorSpot} setter={setMotorSpot} />
        </div>
        <button
          type="submit"
          className="basis-full rounded-lg bg-blue-300 hover:bg-blue-400 py-1.5 border w-full" // Removed bottom-0
        >
          ثبت
        </button>
      </form>
    </div>
  );
};

export default NewCustomer;
