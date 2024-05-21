import { useEffect, useState } from "react";
import FloatLabel from "../common/input";
import api from "../common/api";
import Checkbox from "../common/checkbox";
import { useDispatch, useSelector } from "react-redux";
import { setFiles, setLastFilter, clearLastFilter } from "./filesSlice";

const Filter = () => {
  const dispatch = useDispatch();
  const store = useSelector((state) => state.files);
  let lastFilter = store.lastFilter;

  const [fileType, setFileType] = useState(
    localStorage.getItem("agents_field")
  );
  const [propertyType, setPropertyType] = useState();
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
      let lowerBound = Math.floor(price * 0.8);
      let upperBound = Math.floor(price * 1.2);

      if (lowerBound === 0 && upperBound === 0) {
        setBudgetRange([null, null]);
      } else {
        setBudgetRange([lowerBound, upperBound]);
        console.log(budgetRange)
      }


      console.log(budgetRange);
    }

    if (priceUp === null) {
      setBudgetUpRange([null, null]);
    }
    // rent filter budget range
    else if (fileType === "rent") {
      let lowerBound = Math.floor(priceUp * 0.8);
      let upperBound = Math.floor(priceUp * 1.2);

      if (lowerBound === 0 && upperBound === 0) {
        setBudgetUpRange([null, null]);
      } else {
        setBudgetUpRange([lowerBound, upperBound]);
      }


      if (priceRent === null) {
        setBudgetRentRange([null, null]);
      } else {
        let lowerBoundRent = Math.floor(priceRent * 0.7);
        let upperBoundRent = Math.floor(priceRent * 1.3);

        if (lowerBoundRent === 0 && upperBoundRent === 0) {
          setBudgetRentRange([null, null]);
        } else {
          setBudgetRentRange([lowerBoundRent, upperBoundRent]);
        }
      }
    }
  }, [fileType, price, priceUp, priceRent]);

  // useEffect(() => {
  //
  //   // sell filter budget range
  //   if (fileType === "sell") {
  //
  //     if (price <= 3000) {
  //       setBudgetRange([Math.floor(price * 0.8), Math.floor(price * 1.2)]);
  //     } else if (price > 3000 && price < 5000) {
  //       setBudgetRange([Math.floor(price * 0.85), Math.floor(price * 1.15)]);
  //     } else if (price >= 5000) {
  //       setBudgetRange([Math.floor(price * 0.9), Math.floor(price * 1.1)]);
  //     }
  //
  //     //  default value for budgetRange
  //     if (price === null) {
  //
  //       setBudgetRange([null, null])
  //     }
  //     console.log(budgetRange)
  //   }
  //
  //   if (priceUp === null) {
  //
  //     setBudgetUpRange([null, null])
  //   }
  //   // rent filter budget range
  //   else if (fileType === "rent") {
  //
  //     if (priceUp <= 300) {
  //       setBudgetUpRange([Math.floor(priceUp * 0.8), Math.floor(priceUp * 1.2)]);
  //     } else if (priceUp > 300 && priceUp < 700) {
  //       setBudgetUpRange([Math.floor(priceUp * 0.85), Math.floor(priceUp * 1.15)]);
  //     } else if (priceUp >= 700) {
  //       setBudgetUpRange([Math.floor(priceUp * 0.9), Math.floor(priceUp * 1.1)]);
  //     }
  //
  //
  //     if (priceRent === null) {
  //
  //       setBudgetRentRange([null, null])
  //     }
  //     else if (priceRent <= 3) {
  //       setBudgetRentRange([Math.floor(priceRent * 0.7), Math.floor(priceRent * 1.3)]);
  //     } else if (priceRent > 3 && priceRent < 7) {
  //       setBudgetRentRange([Math.floor(priceRent * 0.8), Math.floor(priceRent * 1.2)]);
  //     } else if (priceRent >= 7) {
  //       setBudgetRentRange([Math.floor(priceRent * 0.85), Math.floor(priceRent * 1.15)]);
  //     }
  //   }
  // }, [fileType, price, priceUp, priceRent]);


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
    price_rent__lte: budgetRentRange[0],
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
    console.log(data)

    api
      .get("listing/", { params: data })
      .then((response) => {
        dispatch(setFiles(response.data));
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
          name="file_type"
          id="file_type"
          defaultValue={fileType}
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
            setter={setPrice}
          />
        ) : (
          <>
            <FloatLabel
              label="ودیعه"
              name="price_up"
              type="number"
              setter={setPriceUp}
            />
            <FloatLabel
              label="اجاره"
              name="price_rent"
              type="number"
              setter={setPriceRent}
            />
          </>
        )}
        <FloatLabel label="متراژ" name="m2" type="number" setter={setM2} />
        <FloatLabel
          label="خواب"
          name="bedroom"
          type="number"
          setter={setBedroom}
        />
        <FloatLabel label="ساخت" name="year" type="number" setter={setYear} />
      </div>
      <div className="grid grid-cols-3 max-w-xs">
        <Checkbox label="پارکینگ" name="parking" setter={setParking} />
        <Checkbox label="آسانسور" name="elevator" setter={setElevator} />
        <Checkbox label="انباری" name="storage" setter={setStorage} />
      </div>
      <div className="flex flex-col gap-3">
        <button
          onClick={() => filter(filterEntery)}
          className="basis-full rounded-lg bg-blue-300 hover:bg-blue-400 py-1 border w-full bottom-0"
        >
          فیلتر
        </button>
        {lastFilter ? (
          <button
            onClick={() => cancelFilter()}
            className="basis-full rounded-lg bg-red-300 hover:bg-red-400 py-1 border w-full bottom-0"
          >
            حذف فیلتر
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default Filter;
