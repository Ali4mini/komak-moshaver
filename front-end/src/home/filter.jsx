import { useEffect, useState } from "react";
import FloatLabel from "../common/input";
import api from "../common/api";
import Checkbox from "../common/checkbox";
import { useDispatch, useSelector } from "react-redux";
import { addFiles, setLastFilter, clearLastFilter, setFiles } from "./filesSlice";

const Filter = () => {
  const dispatch = useDispatch();
  const store = useSelector((state) => state.files);
  let lastFilter = store.lastFilter;

  const [fileType, setFileType] = useState(
    localStorage.getItem("agents_field")
  );
  const [propertyType, setPropertyType] = useState("A");
  const [price, setPrice] = useState(null);
  const [priceUp, setPriceUp] = useState(null);
  const [priceRent, setPriceRent] = useState(null);
  const [m2, setM2] = useState(null);
  const [bedroom, setBedroom] = useState(null);
  const [year, setYear] = useState(null);
  const [parking, setParking] = useState(null);
  const [elevator, setElevator] = useState(null);
  const [storage, setStorage] = useState(null);

  const [budgetRange, setBudgetRange] = useState([null, null]);
  const [budgetUpRange, setBudgetUpRange] = useState([null, null]);
  const [budgetRentRange, setBudgetRentRange] = useState([null, null]);

  useEffect(() => {
    // sell filter budget range
    if (fileType === "sell") {
      let lowerBound = Math.floor(price * 0.75);
      let upperBound = Math.floor(price * 1.25);

      if (lowerBound === 0 && upperBound === 0) {
        setBudgetRange([null, null]);
      } else {
        setBudgetRange([lowerBound, upperBound]);
      }


    }

    if (priceUp === null) {
      setBudgetUpRange([null, null]);
    }
    // rent filter budget range
    else if (fileType === "rent") {
      let lowerBound = Math.floor(priceUp * 0.75);
      let upperBound = Math.floor(priceUp * 1.25);

      if (lowerBound === 0 && upperBound === 0) {
        setBudgetUpRange([null, null]);
      } else {
        setBudgetUpRange([lowerBound, upperBound]);
      }


      if (priceRent === null) {
        setBudgetRentRange([null, null]);
      } else {
        let lowerBoundRent = Math.floor(priceRent * 0.75);
        let upperBoundRent = Math.floor(priceRent * 1.25);

        if (lowerBoundRent === 0 && upperBoundRent === 0) {
          setBudgetRentRange([null, null]);
        } else {
          setBudgetRentRange([lowerBoundRent, upperBoundRent]);
        }
      }
    }
  }, [fileType, price, priceUp, priceRent]);



  //WARN: there is a list of allowed fields that you have to filter based on it in listing api
  let filterEntery = {
    status: "ACTIVE",
    file_type: fileType,
    property_type: propertyType,
    price__gte: budgetRange[0],
    price__lte: budgetRange[1],
    price_up__gte: budgetUpRange[0],
    price_up__lte: budgetUpRange[1],
    price_rent__gte: budgetRentRange[0],
    price_rent__lte: budgetRentRange[1],
    m2__gte: m2,
    bedroom__gte: bedroom,
    year__gte: year,
    parking: parking,
    elevator: elevator,
    storage: storage,
  };


  const filter = (data) => {

    if (data.file_type === "sell") {
      delete data.price_up__lte;
      delete data.price_up__gte;
      delete data.price_rent__gte;
      delete data.price_rent__lte;
    } else if (data.file_type === "rent") {
      delete data.price__lte;
      delete data.price__gte;
    }

    api
      .get("listing/", { params: data })
      .then((response) => {

        console.log(response)
        dispatch(setFiles(response.data.results));
        dispatch(setLastFilter(data));
      })
      .catch((error) => console.log(`error: ${error}`));
  };
  const cancelFilter = () => {
    // Resetting the Redux state
    dispatch(clearLastFilter());

    // Fetching the initial data without filters applied
    api.get("/listing/?page=1", { params: { status: "ACTIVE", file_type: localStorage.getItem("agents_field") } })
      .then((response) => {
        if (response.data.previous === null) {
          dispatch(setFiles(response.data.results));
        } else if (response.data.next) {
          dispatch(addFiles(response.data.results));
        }
      })
      .catch((error) => console.error(error));

    // Resetting local component state
    setFileType(localStorage.getItem("agents_field"));
    setPropertyType("A"); // Assuming 'null' is an acceptable initial value for propertyType
    setPrice(null);
    setPriceUp(null);
    setPriceRent(null);
    setM2(null);
    setBedroom(null);
    setYear(null);
    setParking(null);
    setElevator(null);
    setStorage(null);
    setBudgetRange([null, null]); // Resetting budget ranges
    setBudgetUpRange([null, null]);
    setBudgetRentRange([null, null]);
  };




  return (
    <form
      id="filter"
      className="flex flex-col border-2 rounded-xl mx-4 p-3 h-auto gap-5 shadow"
      onSubmit={(e) => e.preventDefault()}
    >
      <div className="grid grid-cols-3 h-10 max-w-xs">
        <select
          name="file_type"
          id="file_type"
          value={fileType}
          onChange={(e) => {
            setFileType(e.target.value);
            console.log(filterEntery)
          }}
          className="bg-gray-50 border focus:ring-blue-300 text-center focus:border-blue-300 shadow-md w-24 rounded-lg"
        >
          <option id="sell" value="sell">
            فروش
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
          className="bg-gray-50 border focus:ring-blue-300 text-center focus:border-blue-300 shadow-md  w-24 rounded-lg"
        >
          <option value="A">آپارتمان</option>
          <option value="L">زمین</option>
          <option value="S">مغازه</option>
          <option value="H">خانه و ویلا</option>
        </select>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 basis-full gap-3">
        {fileType === "sell" ? (
          <FloatLabel
            label="قیمت"
            name="price"
            type="number"
            value={price}
            setter={setPrice}
          />
        ) : (
          <>
            <FloatLabel
              label="ودیعه"
              name="price_up"
              type="number"
              value={priceUp}
              setter={setPriceUp}
            />
            <FloatLabel
              label="اجاره"
              name="price_rent"
              type="number"
              value={priceRent}
              setter={setPriceRent}
            />
          </>
        )}
        <FloatLabel
          label="متراژ"
          name="m2"
          type="number"
          value={m2}
          setter={setM2}
        />
        <FloatLabel
          label="خواب"
          name="bedroom"
          type="number"
          value={bedroom}
          setter={setBedroom}
        />
        <FloatLabel
          label="ساخت"
          name="year"
          type="number"
          value={year}
          setter={setYear}
        />
      </div>
      <div className="grid grid-cols-3 max-w-xs">
        <Checkbox label="پارکینگ" name="parking" setter={setParking} />
        <Checkbox label="آسانسور" name="elevator" setter={setElevator} />
        <Checkbox label="انباری" name="storage" setter={setStorage} />
      </div>
      <div className="flex flex-col gap-3">
        {lastFilter ? (
          <button
            onClick={() => cancelFilter()}
            className="basis-full rounded-lg bg-red-300 hover:bg-red-400 py-1 border w-full bottom-0"
          >
            حذف فیلتر
          </button>
        ) :

          <button
            onClick={() => filter(filterEntery)}
            className="basis-full rounded-lg bg-blue-300 hover:bg-blue-400 py-1 border w-full bottom-0"
          >
            فیلتر
          </button>
        }
      </div>
    </form>
  );
};

export default Filter;
