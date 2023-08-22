import { useRef, useState } from "react";
import FloatLabel from "../common/input";
import api from "../common/api";
import Checkbox from "../common/checkbox";
import { useDispatch, useSelector } from "react-redux";
import { setFiles, setLastFilter, clearLastFilter } from "./filesSlice";
import Files from "./files";

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

  let filterEntery = {
    file_type: fileType,
    property_type: propertyType,
    price__lte: price,
    price_up__lte: priceUp,
    price_rent__lte: priceRent,
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
      delete data.price_rent__lte;
    } else if (data.file_type === "rent") {
      delete data.price__lte;
    }

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
      <div className="flex sm:flex-col md:flex-row basis-full gap-5">
        <select
          name="file_type"
          id="file_type"
          defaultValue={fileType}
          onChange={(e) => {
            setFileType(e.target.value);
          }}
          className="bg-gray-50 border focus:ring-blue-300 text-center focus:border-blue-300 shadow-md w-32 h-10 rounded-lg"
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
          className="bg-gray-50 border focus:ring-blue-300 text-center focus:border-blue-300 shadow-md  w-32 h-10 rounded-lg"
        >
          <option value="A">آپارتمان</option>
          <option value="L">زمین</option>
          <option value="S">مغازه</option>
          <option value="H">خانه و ویلا</option>
        </select>
      </div>
      <div className="flex sm:flex-col md:flex-row basis-full gap-3">
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
