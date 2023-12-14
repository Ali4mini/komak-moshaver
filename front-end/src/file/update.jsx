import FloatLabel from "../common/input";
import Checkbox from "../common/checkbox";
import { useEffect, useState } from "react";
import api from "../common/api";
import { useNavigate, useParams } from "react-router-dom";

const UpdateFile = () => {
  const { fileType, id } = useParams();
  const [oldFile, setOldFile] = useState(null);

  useEffect(() => {
    api
      .get(`file/${fileType}/${id}/`)
      .then((response) => {
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
  const [floor, setFloor] = useState(oldFile ? oldFile.floor : "");
  const [floors, setFloors] = useState(oldFile ? oldFile.tabaghat : "");
  const [units, setUnits] = useState(oldFile ? oldFile.vahedha : "");
  const [parking, setParking] = useState(oldFile ? oldFile.parking : "");
  const [elevator, setElevator] = useState(oldFile ? oldFile.elevator : "");
  const [storage, setStorage] = useState(oldFile ? oldFile.storage : "");
  const [motorSpot, setMotorSpot] = useState(
    oldFile ? oldFile.parking_motor : ""
  );
  const [ownerName, setOwnerName] = useState(oldFile ? oldFile.owner_name : "");
  const [ownerPhone, setOwnerPhone] = useState(
    oldFile ? oldFile.owner_phone : ""
  );

  const navigate = useNavigate();

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
    floor: floor,
    tabaghat: floors,
    vahedha: units,
    parking: parking,
    elevator: elevator,
    storage: storage,
    parking_motor: motorSpot,
    owner_name: ownerName,
    owner_phone: ownerPhone,
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
      .then(navigate("/", { replace: true }))
      .catch((error) => console.log(error.data));
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

            <FloatLabel
              defValue={oldFile.m2}
              type="number"
              name={"m2"}
              label={"متراژ"}
              setter={setM2}
              isRequired={true}
            />
            <FloatLabel
              defValue={oldFile.year}
              type="number"
              name={"year"}
              label={"ساخت"}
              setter={setYear}
              isRequired={true}
            />
            <FloatLabel
              defValue={oldFile.bedroom}
              type="number"
              name={"bedroom"}
              label={"خواب"}
              setter={setBedroom}
              isRequired={true}
            />

            <FloatLabel
              defValue={oldFile.floor}
              type="number"
              name={"floor"}
              label={"طبقه"}
              setter={setFloor}
              isRequired={true}
            />
            <FloatLabel
              defValue={oldFile.tabaghat}
              type="number"
              name={"floors"}
              label={"طبقات"}
              setter={setFloors}
              isRequired={true}
            />
            <FloatLabel
              defValue={oldFile.vahedha}
              type="number"
              name={"units"}
              label={"واحد ها"}
              setter={setUnits}
              isRequired={true}
            />
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
