import FloatLabel from "../common/input";
import Checkbox from "../common/checkbox";
import { useState } from "react";
import api from "../common/api";
import { useNavigate } from "react-router-dom";
import { setFlashMessage } from "../common/flashSlice";
import { useDispatch } from "react-redux";
import CustomDatePicker from "../common/datePicker";

const NewFile = () => {
  const [fileType, setFileType] = useState(
    localStorage.getItem("agents_field")
  );
  const [propertyType, setPropertyType] = useState("A");
  const [address, setAddress] = useState(null);
  const [m2, setM2] = useState(null);
  const [year, setYear] = useState(null);
  const [bedroom, setBedroom] = useState(null);
  const [price, setPrice] = useState(null);
  const [upPrice, setUpPrice] = useState(null);
  const [rentPrice, setRentPrice] = useState(null);
  const [hasTabdil, setHasTabdil] = useState("no");
  const [tabdil, setTabdil] = useState(null);
  const [floor, setFloor] = useState(null);
  const [floors, setFloors] = useState(null);
  const [units, setUnits] = useState(null);
  const [parking, setParking] = useState(false);
  const [elevator, setElevator] = useState(false);
  const [storage, setStorage] = useState(false);
  const [motorSpot, setMotorSpot] = useState(false);
  const [ownerName, setOwnerName] = useState(null);
  const [ownerPhone, setOwnerPhone] = useState(null);
  const [bazdid, setBazdid] = useState("هماهنگی");
  const [tenetPhone, setTenetPhone] = useState(null);
  const [tenetName, setTenetName] = useState(null);
  const [lobbyManName, setLobbyManName] = useState(null);
  const [lobbyManPhone, setLobbyManPhone] = useState(null);
  const [description, setDescription] = useState(null)
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])

  const [selectedFiles, setSelectedFiles] = useState(null);
  const user = localStorage.getItem("user");

  const navigate = useNavigate();
  const dispatch = useDispatch();

  let fileEntery = {
    username: user,
    file_type: fileType,
    property_type: propertyType,
    date: date,
    updated: date,
    address: address,
    m2: m2,
    year: year,
    bedroom: bedroom,
    price: price,
    price_up: upPrice,
    price_rent: rentPrice,
    tabdil: tabdil,
    floor: floor,
    tabaghat: floors,
    vahedha: units,
    parking: parking,
    elevator: elevator,
    storage: storage,
    parking_motor: motorSpot,
    owner_name: ownerName,
    owner_phone: ownerPhone,
    bazdid: bazdid,
    tenet_name: tenetName,
    tenet_phone: tenetPhone,
    lobbyMan_name: lobbyManName,
    lobbyMan_phone: lobbyManPhone,
    description: description,
  };

  if (fileType === "SELL") {
    delete fileEntery.price_up;
    delete fileEntery.price_rent;
  } else if (fileType === "RENT") {
    delete fileEntery.price;
  }

  const create = (fileEntery, event) => {
    event.preventDefault();
    if (ownerPhone.length < 11 || tenetPhone?.length < 11 || lobbyManPhone?.length < 11) {
      alert("شماره تلفن باید ۱۱ رقم باشد");
      return; // Stop submission if validation fails
    }
    api
      .post(`file/${fileEntery.file_type}/new/`, fileEntery)
      .then((response) => {
        switch (response.status) {
          case 201:
            console.log(response.data)
            handleUpload(`file/${response.data["file_type"]}/${response.data["id"]}/images/`)

            dispatch(
              setFlashMessage({
                type: "SUCCESS",
                message: `یک فایل اضافه شد \n کد: ${response.data["id"]}`,
              })
            );
            break;
        }
      })
      .catch((error) => console.log(error.data));
    navigate("/", { replace: true });
  };

  const handleFileChange = (event) => {
    setSelectedFiles(event.target.files);
  };
  const handleUpload = async (endpoint) => {
    const formData = new FormData();
    Array.from(selectedFiles).forEach((file) => {
      formData.append('image_files', file);
    });

    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };

    try {
      const response = await api.post(endpoint, formData, config);
      console.log(response);
    } catch (error) {
      console.error(error);
    }
  };
  return (

    <div className="block border shadow-lg rounded-xl bg-white mx-4 px-4 py-2 my-2">
      <form
        onSubmit={(e) => create(fileEntery, e)}
        className="flex flex-col gap-5 text-sm md:text-base"
      >
        <div className="flex h-10 justify-between w-full">
          <div className="flex gap-2 h-10 right-0">

            <select
              name="file_type"
              id="file_type"
              onChange={(e) => {
                setFileType(e.target.value);
              }}
              defaultValue={fileType}
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
              defaultValue={propertyType}
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

          <div className="flex flex-row gap-3 left-0">

            <p className="font-bold text-center justify-center items-center">تاریخ: </p>
            <div className="" style={{ direction: "rtl" }}>
              <CustomDatePicker setter={setDate} />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1  w-full ">
          <FloatLabel
            type="text"
            name={"address"}
            label={"آدرس"}
            setter={setAddress}
            isRequired={true}
          />
        </div>
        <div className="grid grid-cols-2 gap-y-4 gap-x-2  md:grid-cols-4 lg:grid-cols-7 w-full flex-wrap gap-2">
          {fileType === "sell" ? (
            <FloatLabel
              type="number"
              name={"price"}
              label={"قیمت"}
              setter={setPrice}
              isRequired={true}
            />
          ) : (
            <>
              <FloatLabel
                type="number"
                name={"upPrice"}
                label={"ودیعه"}
                setter={setUpPrice}
                isRequired={true}
              />
              <FloatLabel
                type="number"
                name={"rentPrice"}
                label={"اجاره"}
                setter={setRentPrice}
                isRequired={true}
              />

              <select
                name="hasTabdil"
                id="hasTabdil"
                onChange={(e) => {
                  setHasTabdil(e.target.value);
                }}
                className="bg-gray-50 border my-auto focus:ring-blue-300 text-center focus:border-blue-300 shadow-md w-24 h-10 rounded-lg"
              >
                <option value="no">تبدیل ندارد</option>
                <option value="yes">تبدیل دارد</option>
              </select>

              {hasTabdil === "yes" ? (
                <div className="flex flex-row gap-2 max-w-sm">
                  <FloatLabel
                    type="number"
                    name={"tabdil"}
                    label={"تبدیل تا"}
                    setter={setTabdil}
                    isRequired={false}
                  />
                </div>
              ) : null}

            </>
          )}

          <FloatLabel
            type="number"
            name={"m2"}
            label={"متراژ"}
            setter={setM2}
            isRequired={true}
          />

          {propertyType === "A" ? (
            <>
              <FloatLabel
                type="number"
                name={"bedroom"}
                label={"اتاق خواب"}
                setter={setBedroom}
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
                name={"floor"}
                label={"طبقه"}
                setter={setFloor}
                isRequired={true}
              />
              <FloatLabel
                type="number"
                name={"floors"}
                label={"طبقات"}
                setter={setFloors}
                isRequired={true}
              />
              <FloatLabel
                type="number"
                name={"units"}
                label={"واحد ها"}
                setter={setUnits}
                isRequired={true}
              />
            </>
          ) : propertyType === "S" ? (
            <>
              <FloatLabel
                type="number"
                name={"year"}
                label={"سال ساخت"}
                setter={setYear}
                isRequired={true}
              />
            </>
          ) : propertyType === "H" ? (
            <>
              <FloatLabel
                type="number"
                name={"floors"}
                label={"طبقات"}
                setter={setFloors}
                isRequired={true}
              />
              <FloatLabel
                type="number"
                name={"bedroom"}
                label={"اتاق خواب"}
                setter={setBedroom}
                isRequired={true}
              />
            </>
          ) : null}
        </div>
        <div className="grid grid-cols-1 gap-2">
          <div className="flex gap-2">
            <label
              htmlFor="bazdid"
              className="h-full px-auto pt-1 text-gray-500 text-lg"
            >
              بازدید:
            </label>
            <select
              name="bazdid"
              id="bazdid"
              onChange={(e) => {
                setBazdid(e.target.value);
              }}
              className="bg-gray-50 border my-auto focus:ring-blue-300 text-center focus:border-blue-300 shadow-md w-24 h-10 rounded-lg"
            >
              <option value="هماهنگی">هماهنگی</option>
              <option value="صبح">صبح</option>
              <option value="بعدازظهر">بعدازظهر</option>
              <option value="مستاجر">مستاجر</option>
              <option value="سرایدار">سرایدار</option>
            </select>
          </div>

          {bazdid === "مستاجر" ? (
            <div className="flex flex-row gap-2 max-w-sm">
              <FloatLabel
                type="text"
                name={"ownerPhone"}
                label={"شماره مستاجر"}
                setter={setTenetPhone}
                isRequired={true}
                maxChars={11}
              />
              <FloatLabel
                type="text"
                name={"ownerName"}
                label={"نام مستاجر"}
                setter={setTenetName}
                isRequired={true}
              />
            </div>
          ) : null}

          {bazdid === "سرایدار" ? (
            <div className="flex flex-row gap-2 max-w-sm">
              <FloatLabel
                type="text"
                name={"ownerPhone"}
                label={"شماره سرایدار"}
                setter={setLobbyManPhone}
                isRequired={true}
                maxChars={11}
              />
              <FloatLabel
                type="text"
                name={"ownerName"}
                label={"نام سرایدار"}
                setter={setLobbyManName}
                isRequired={true}
              />
            </div>
          ) : null}
        </div>
        <div className="grid grid-cols-2 max-w-sm gap-2">
          <FloatLabel
            type="text"
            name={"ownerPhone"}
            label={"شماره مالک"}
            setter={setOwnerPhone}
            isRequired={true}
            maxChars={11}
          />
          <FloatLabel
            type="text"
            name={"ownerName"}
            label={"نام مالک"}
            setter={setOwnerName}
            isRequired={true}
          />
        </div>
        <div className="grid grid-cols-2 h-12 gap-2">
          <FloatLabel
            type="text"
            name={"description"}
            label={"توضیحات"}
            setter={setDescription}
            isRequired={false}
          />
        </div>

        <div className="flex h-12 gap-2">
          <input type="file" multiple id="customFileInput" onChange={handleFileChange} className="hidden" />

          <label htmlFor="customFileInput" className="flex cursor-pointer w-32 bg-blue-200 text-black items-center justify-center align-middle font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-400 transition duration-150 ease-in-out">انتحاب عکس</label>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-4 max-w-sm gap-y-1">
          <Checkbox label="پارکینگ" name="parking" setter={setParking} />
          <Checkbox label="آسانسور" name="elevator" setter={setElevator} />
          <Checkbox label="انباری" name="storage" setter={setStorage} />
          <Checkbox label="پارک موتور" name="motorSpot" setter={setMotorSpot} />
        </div>
        <button
          type="submit"
          className="basis-full rounded-lg bg-blue-300 hover:bg-blue-400 py-1.5 border w-full bottom-0"
        >
          ثبت
        </button>
      </form >
    </div >
  );
};

export default NewFile;
