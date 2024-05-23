import FloatLabel from "../common/input";
import Checkbox from "../common/checkbox";
import { useEffect, useState } from "react";
import api from "../common/api";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setFlashMessage } from "../common/flashSlice";

const UpdateFile = () => {
  const { fileType, id } = useParams();
  const [oldFile, setOldFile] = useState(null);
  const dispatch = useDispatch();

  // get the old file
  useEffect(() => {
    api
      .get(`file/${fileType}/${id}/`)
      .then((response) => {
        console.log(response.data.description)
        setOldFile(response.data);
      })
      .catch((error) => console.log(error.data));
  }, []);

  const [propertyType, setPropertyType] = useState(
    oldFile ? oldFile.property_type : ""
  );
  const [address, setAddress] = useState(oldFile ? oldFile.address : "");
  const [m2, setM2] = useState(oldFile ? oldFile.m2 : "");
  const [year, setYear] = useState(oldFile ? oldFile.year : "");
  const [bedroom, setBedroom] = useState(oldFile ? oldFile.bedroom : "");
  const [price, setPrice] = useState(oldFile ? oldFile.price : "");
  const [upPrice, setUpPrice] = useState(oldFile ? oldFile.price_up : "");
  const [rentPrice, setRentPrice] = useState(oldFile ? oldFile.price_rent : "");
  const [tabdil, setTabdil] = useState(null);
  const [floor, setFloor] = useState(oldFile ? oldFile.floor : "");
  const [floors, setFloors] = useState(oldFile ? oldFile.tabaghat : "");
  const [units, setUnits] = useState(oldFile ? oldFile.vahedha : "");
  const [bazdid, setBazdid] = useState("هماهنگی");
  const [parking, setParking] = useState(oldFile ? oldFile.parking : "");
  const [elevator, setElevator] = useState(oldFile ? oldFile.elevator : "");
  const [storage, setStorage] = useState(oldFile ? oldFile.storage : "");
  const [motorSpot, setMotorSpot] = useState(
    oldFile ? oldFile.parking_motor : ""
  );
  const [tenetPhone, setTenetPhone] = useState(null);
  const [tenetName, setTenetName] = useState(null);
  const [ownerName, setOwnerName] = useState(oldFile ? oldFile.owner_name : "");
  const [ownerPhone, setOwnerPhone] = useState(
    oldFile ? oldFile.owner_phone : ""
  );

  const [description, setDescription] = useState(oldFile ? oldFile.description : "");
  const navigate = useNavigate();
  const [selectedFiles, setSelectedFiles] = useState(null);

  let updatedEntery = {
    file_type: fileType,
    property_type: propertyType,
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
    description: description,
  };

  useEffect(() => {
    if (oldFile) {
      setPropertyType(oldFile.property_type);
      setAddress(oldFile.address);
      setM2(oldFile.m2);
      setYear(oldFile.year);
      setBedroom(oldFile.bedroom);
      setPrice(oldFile.price);
      setUpPrice(oldFile.price_up);
      setRentPrice(oldFile.price_rent);
      setFloor(oldFile.floor);
      setFloors(oldFile.tabaghat);
      setUnits(oldFile.vahedha);
      setParking(oldFile.parking);
      setElevator(oldFile.elevator);
      setStorage(oldFile.storage);
      setMotorSpot(oldFile.parking_motor);
      setOwnerName(oldFile.owner_name);
      setOwnerPhone(oldFile.owner_phone);
    }
  }, [oldFile]);

  const update = (updatedFile, event) => {
    event.preventDefault();
    api
      .patch(`file/${fileType}/${id}/`, updatedFile)
      .then((response) => {

        switch (response.status) {
          case 200:
            handleUpload(`file/${fileType}/${id}/images/`)
            navigate(`/file/${fileType}/${id}/`, { replace: true })

            dispatch(
              setFlashMessage({
                type: "SUCCESS",
                message: "یک فایل اضافه شد",
              }))
        }
      }

      )
      .catch((error) => console.log(error.data));
  };

  const handleFileChange = (event) => {
    setSelectedFiles(event.target.files);
  };
  const handleUpload = async (endpoint) => {
    const formData = new FormData();
    Array.from(selectedFiles).forEach((file) => {
      formData.append('images', file);
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

  if (oldFile) {
    return (
      <div className="block border shadow-lg rounded-xl bg-white mx-4 px-4 py-2 my-2">
        <form
          onSubmit={(e) => update(updatedEntery, e)}
          className="flex flex-col gap-5 text-sm md:text-base"
        >
          <div className="grid grid-cols-3 max-w-xs h-10 gap-2">
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
          <div className="grid grid-cols-1  w-full ">
            <FloatLabel
              defValue={oldFile.address}
              type="text"
              name={"address"}
              label={"آدرس"}
              setter={setAddress}
              isRequired={true}
            />
          </div>
          <div className="grid grid-cols-2 gap-y-4 gap-x-2 md:grid-cols-4 lg:grid-cols-7 w-full flex-wrap gap-2">
            {fileType === "sell" ? (
              <FloatLabel
                defValue={oldFile.price}
                type="number"
                name={"price"}
                label={"قیمت"}
                setter={setPrice}
                isRequired={true}
              />
            ) : (
              <>
                <FloatLabel
                  defValue={oldFile.price_up}
                  type="number"
                  name={"upPrice"}
                  label={"ودیعه"}
                  setter={setUpPrice}
                  isRequired={true}
                />
                <FloatLabel
                  defValue={oldFile.price_rent}
                  type="number"
                  name={"rentPrice"}
                  label={"اجاره"}
                  setter={setRentPrice}
                  isRequired={true}
                />
              </>
            )}

            {fileType == "rent" ?

              <FloatLabel
                defValue={oldFile.tabdil}
                type="number"
                name={"tabdil"}
                label={"تبدیل"}
                setter={setTabdil}
                isRequired={false}
              /> : null
            }
            <FloatLabel
              defValue={oldFile.m2}
              type="number"
              name={"m2"}
              label={"متراژ"}
              setter={setM2}
              isRequired={false}
            />

            <FloatLabel
              defValue={oldFile.bedroom}
              type="number"
              name={"bedroom"}
              label={"خواب"}
              setter={setBedroom}
              isRequired={false}
            />
            <FloatLabel
              defValue={oldFile.year}
              type="number"
              name={"year"}
              label={"ساخت"}
              setter={setYear}
              isRequired={false}
            />

            <FloatLabel
              defValue={oldFile.floor}
              type="number"
              name={"floor"}
              label={"طبقه"}
              setter={setFloor}
              isRequired={false}
            />
            <FloatLabel
              defValue={oldFile.tabaghat}
              type="number"
              name={"floors"}
              label={"طبقات"}
              setter={setFloors}
              isRequired={false}
            />
            <FloatLabel
              defValue={oldFile.vahedha}
              type="number"
              name={"units"}
              label={"واحد ها"}
              setter={setUnits}
              isRequired={false}
            />
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
              </select>
            </div>

            {bazdid === "مستاجر" ? (
              <div className="flex flex-row gap-2 max-w-sm">
                <FloatLabel
                  defValue={oldFile.tenetName}
                  type="text"
                  name={"ownerPhone"}
                  label={"شماره مستاجر"}
                  setter={setTenetPhone}
                  isRequired={false}
                />
                <FloatLabel
                  defValue={oldFile.tenetPhone}
                  type="text"
                  name={"ownerName"}
                  label={"نام مستاجر"}
                  setter={setTenetName}
                  isRequired={false}
                />
              </div>
            ) : null}
          </div>
          <div className="grid grid-cols-2 max-w-sm gap-2">
            <FloatLabel
              defValue={oldFile.owner_phone}
              type="text"
              name={"ownerPhone"}
              label={"شماره مالک"}
              setter={setOwnerPhone}
              isRequired={true}
            />
            <FloatLabel
              defValue={oldFile.owner_name}
              type="text"
              name={"ownerName"}
              label={"نام مالک"}
              setter={setOwnerName}
              isRequired={true}
            />
          </div>
          <div className="grid grid-cols-2 h-12 gap-2">
            <FloatLabel
              defValue={oldFile.description}
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
            <Checkbox
              label="پارکینگ"
              name="parking"
              setter={setParking}
              isChecked={oldFile.parking}
            />
            <Checkbox
              label="آسانسور"
              name="elevator"
              setter={setElevator}
              isChecked={oldFile.elevator}
            />
            <Checkbox
              label="انباری"
              name="storage"
              setter={setStorage}
              isChecked={oldFile.storage}
            />
            <Checkbox
              label="پارک موتور"
              name="motorSpot"
              setter={setMotorSpot}
              isChecked={oldFile.parking_motor}
            />
          </div>
          <button
            type="submit"
            className="basis-full rounded-lg bg-blue-300 hover:bg-blue-400 py-1.5 border w-full bottom-0"
          >
            ثبت
          </button>
        </form>
      </div>
    );
  }
};

export default UpdateFile;
