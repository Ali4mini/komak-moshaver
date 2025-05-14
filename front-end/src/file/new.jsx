import FloatLabel from "../common/input";
import Checkbox from "../common/checkbox";
import { useState, useEffect } from "react"; // Added useEffect for one-time localStorage read if preferred
import { api } from "../common/api";
// import { useNavigate } from "react-router-dom"; // No longer needed for navigation on submit
import { setFlashMessage } from "../common/flashSlice";
import { useDispatch } from "react-redux";
import NewLocation from "../common/newLocation.jsx";
import CustomDatePicker from "../common/datePicker";

const NewFile = () => {
  const initialFileType = (localStorage.getItem("agents_field") || "sell").toLowerCase();
  const initialDate = new Date().toISOString().split("T")[0];

  const [fileType, setFileType] = useState(initialFileType);
  const [propertyType, setPropertyType] = useState("A");
  const [address, setAddress] = useState(""); // Use "" for empty text fields
  const [m2, setM2] = useState("");
  const [year, setYear] = useState("");
  const [bedroom, setBedroom] = useState("");
  const [price, setPrice] = useState("");
  const [upPrice, setUpPrice] = useState("");
  const [rentPrice, setRentPrice] = useState("");
  const [hasTabdil, setHasTabdil] = useState("no");
  const [tabdil, setTabdil] = useState("");
  const [floor, setFloor] = useState("");
  const [floors, setFloors] = useState("");
  const [units, setUnits] = useState("");
  const [parking, setParking] = useState(false);
  const [elevator, setElevator] = useState(false);
  const [storage, setStorage] = useState(false);
  const [motorSpot, setMotorSpot] = useState(false);
  const [ownerName, setOwnerName] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [bazdid, setBazdid] = useState("هماهنگی");
  const [tenetPhone, setTenetPhone] = useState("");
  const [tenetName, setTenetName] = useState("");
  const [lobbyManName, setLobbyManName] = useState("");
  const [lobbyManPhone, setLobbyManPhone] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(initialDate);

  const [location, setLocation] = useState(null); // Assuming NewLocation uses this
  const [selectedFiles, setSelectedFiles] = useState(null);
  const user = localStorage.getItem("user");

  // const navigate = useNavigate(); // No longer needed for navigation on submit
  const dispatch = useDispatch();

  const resetForm = () => {
    setFileType((localStorage.getItem("agents_field") || "sell").toLowerCase());
    setPropertyType("A");
    setAddress("");
    setM2("");
    setYear("");
    setBedroom("");
    setPrice("");
    setUpPrice("");
    setRentPrice("");
    setHasTabdil("no");
    setTabdil("");
    setFloor("");
    setFloors("");
    setUnits("");
    setParking(false);
    setElevator(false);
    setStorage(false);
    setMotorSpot(false);
    setOwnerName("");
    setOwnerPhone("");
    setBazdid("هماهنگی");
    setTenetPhone("");
    setTenetName("");
    setLobbyManName("");
    setLobbyManPhone("");
    setDescription("");
    setDate(new Date().toISOString().split("T")[0]);
    setLocation(null); // Reset location state for NewLocation component
    setSelectedFiles(null);

    // Clear the file input visually
    const fileInput = document.getElementById('customFileInput');
    if (fileInput) {
      fileInput.value = null;
    }
    // If NewLocation has its own internal state that needs resetting,
    // you might need to pass a prop or use a ref to trigger its reset.
    // For now, setLocation(null) is the assumed way.
  };


  const handleLocation = async (fileTypeRes, fileIdRes, loc) => { // Renamed params to avoid conflict
    if (!loc) { // Don't make API call if location is not set
      console.log("Location not set, skipping location update.");
      return;
    }
    const data = {
      location: loc,
      file: fileIdRes,
    };
    // The endpoint was `file/${fileType}/${fileId}/location/`
    // Make sure fileTypeRes is what you need (e.g. "sell", "rent")
    return await api.post(`file/${fileTypeRes}/${fileIdRes}/location/`, data);
  };

  const handleUpload = async (endpoint) => {
    if (!selectedFiles || selectedFiles.length === 0) {
      console.log("No files selected for upload.");
      return;
    }
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
      console.log("Upload response:", response);
    } catch (error) {
      console.error("Upload error:", error);
      dispatch(
        setFlashMessage({
          type: "ERROR",
          message: `فایل ثبت شد اما آپلود عکس ناموفق بود: ${error.message || 'خطای سرور'}`,
        })
      );
      // Rethrow or handle as needed, form will still reset if main post was successful
    }
  };

  const create = async (event) => { // Made create async
    event.preventDefault();

    // Construct fileEntery inside the submit handler to get the latest state
    let fileEnteryData = { // Renamed to avoid confusion with outer scope if any
      username: user,
      file_type: fileType, // ensure this is "sell" or "rent" as API expects
      property_type: propertyType,
      date: date,
      updated: date, // Assuming 'updated' should also be the current submission date
      address: address,
      m2: m2 ? Number(m2) : null, // Ensure numbers are numbers
      year: year ? Number(year) : null,
      bedroom: bedroom ? Number(bedroom) : null,
      price: price ? Number(price) : null,
      price_up: upPrice ? Number(upPrice) : null,
      price_rent: rentPrice ? Number(rentPrice) : null,
      tabdil: tabdil ? Number(tabdil) : null,
      floor: floor ? Number(floor) : null,
      tabaghat: floors ? Number(floors) : null,
      vahedha: units ? Number(units) : null,
      parking: parking,
      elevator: elevator,
      storage: storage,
      parking_motor: motorSpot,
      owner_name: ownerName,
      owner_phone: ownerPhone,
      bazdid: bazdid,
      tenet_name: tenetName || null, // Send null if empty
      tenet_phone: tenetPhone || null,
      lobbyMan_name: lobbyManName || null,
      lobbyMan_phone: lobbyManPhone || null,
      description: description || null,
    };

    if (fileType === "sell") {
      delete fileEnteryData.price_up;
      delete fileEnteryData.price_rent;
      delete fileEnteryData.tabdil; // Tabdil is only for rent
    } else if (fileType === "rent") {
      delete fileEnteryData.price;
    }

    // Improved Validation
    if (!ownerPhone || ownerPhone.length !== 11) {
      alert("شماره تلفن مالک الزامی و باید ۱۱ رقم باشد.");
      return;
    }
    if (!ownerName) {
      alert("نام مالک الزامی است.");
      return;
    }
    // If other fields are truly required, add checks here e.g.
    if (!address) {
        alert("آدرس الزامی است.");
        return;
    }
    if (!m2) {
        alert("متراژ الزامی است.");
        return;
    }
    // Add more required field checks as necessary for fileType/propertyType combinations

    if (tenetPhone && tenetPhone.length !== 11) {
      alert("شماره تلفن مستاجر در صورت ورود باید ۱۱ رقم باشد.");
      return;
    }
    if (lobbyManPhone && lobbyManPhone.length !== 11) {
      alert("شماره تلفن سرایدار در صورت ورود باید ۱۱ رقم باشد.");
      return;
    }

    try {
      const response = await api.post(`file/${fileEnteryData.file_type}/new/`, fileEnteryData);
      if (response.status === 201) {
        console.log("File creation response:", response.data);
        const fileId = response.data["id"];
        const createdFileType = response.data["file_type"]; // Use type from response

        // Perform auxiliary actions, awaiting them
        // Pass current `location` state to handleLocation
        await handleLocation(createdFileType, fileId, location);
        if (selectedFiles && selectedFiles.length > 0) {
          await handleUpload(`file/${createdFileType}/${fileId}/images/`);
        }


        dispatch(
          setFlashMessage({
            type: "SUCCESS",
            message: `یک فایل با موفقیت اضافه شد \n کد: ${fileId}`,
          })
        );
        resetForm(); // Reset the form fields
      } else {
        // Handle other non-201 success statuses if necessary
        console.warn("File creation returned status:", response.status, response.data);
        dispatch(
          setFlashMessage({
            type: "WARNING",
            message: `فایل ثبت شد اما با وضعیت غیرمنتظره: ${response.status}`,
          })
        );
        resetForm(); // Optionally reset even on other success statuses
      }
    } catch (error) {
      console.error("File creation error:", error.response ? error.response.data : error.message);
      dispatch(
        setFlashMessage({
          type: "ERROR",
          message: `خطا در ثبت فایل: ${error.response?.data?.detail || error.message || 'لطفا دوباره تلاش کنید.'}`,
        })
      );
      // Do not reset form on error, so user can correct and resubmit
    }
    // navigate("/", { replace: true }); // REMOVED
  };

  const handleFileChange = (event) => {
    setSelectedFiles(event.target.files);
  };

  // Effect to update fileType related fields visibility if fileType changes
  // This is mostly handled by conditional rendering, but if you had complex logic:
  useEffect(() => {
    if (fileType === "sell") {
      // Reset rent-specific fields if switching to sell
      setUpPrice("");
      setRentPrice("");
      setHasTabdil("no");
      setTabdil("");
    } else if (fileType === "rent") {
      // Reset sell-specific fields if switching to rent
      setPrice("");
    }
  }, [fileType]);


  return (
    <div className="block border shadow-lg rounded-xl bg-white mx-4 px-4 py-2 my-2">
      <form
        onSubmit={create} // Pass the function reference directly
        className="flex flex-col gap-5 text-sm md:text-base"
      >
        <div className="flex h-10 justify-between w-full">
          <div className="flex gap-2 h-10 right-0">
            <select
              name="file_type"
              id="file_type"
              value={fileType} // Use value for controlled component
              onChange={(e) => {
                setFileType(e.target.value);
              }}
              className="bg-gray-50 border focus:ring-blue-300 text-center focus:border-blue-300 shadow-md w-24 rounded-lg"
            >
              <option value="sell">فروش</option>
              <option value="rent">اجاره</option>
            </select>
            <select
              name="property_type"
              id="property_type"
              value={propertyType} // Use value for controlled component
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
            <p className="font-bold text-center">تاریخ: </p> {/* Removed justify-center items-center */}
            <div style={{ direction: "rtl" }}>
              <CustomDatePicker date={date} setter={setDate} /> {/* Pass date for controlled component */}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 w-full">
          <FloatLabel
            type="text"
            name={"address"}
            label={"آدرس"}
            value={address} // Controlled component
            setter={setAddress}
            isRequired={true}
          />
        </div>
        <div className="grid grid-cols-2 gap-y-4 gap-x-2 md:grid-cols-4 lg:grid-cols-7 w-full flex-wrap"> {/* Removed gap-2 from main grid class */}
          {fileType === "sell" ? (
            <FloatLabel
              type="number"
              name={"price"}
              label={"قیمت"}
              value={price} // Controlled component
              setter={setPrice}
              isRequired={true}
            />
          ) : (
            <>
              <FloatLabel
                type="number"
                name={"upPrice"}
                label={"ودیعه"}
                value={upPrice} // Controlled component
                setter={setUpPrice}
                isRequired={true}
              />
              <FloatLabel
                type="number"
                name={"rentPrice"}
                label={"اجاره"}
                value={rentPrice} // Controlled component
                setter={setRentPrice}
                isRequired={true}
              />
              <select
                name="hasTabdil"
                id="hasTabdil"
                value={hasTabdil} // Controlled component
                onChange={(e) => {
                  setHasTabdil(e.target.value);
                  if (e.target.value === "no") {
                    setTabdil(""); // Clear tabdil if "no" is selected
                  }
                }}
                className="bg-gray-50 border my-auto focus:ring-blue-300 text-center focus:border-blue-300 shadow-md w-24 h-10 rounded-lg"
              >
                <option value="no">تبدیل ندارد</option>
                <option value="yes">تبدیل دارد</option>
              </select>
              {hasTabdil === "yes" && ( // Use && for concise conditional rendering
                <div className="flex flex-row gap-2 max-w-sm">
                  <FloatLabel
                    type="number"
                    name={"tabdil"}
                    label={"تبدیل تا"}
                    value={tabdil} // Controlled component
                    setter={setTabdil}
                    isRequired={false} // Tabdil itself is not required, only if hasTabdil is yes
                  />
                </div>
              )}
            </>
          )}
          <FloatLabel
            type="number"
            name={"m2"}
            label={"متراژ"}
            value={m2} // Controlled component
            setter={setM2}
            isRequired={true}
          />
          {propertyType === "A" && (
            <>
              <FloatLabel
                type="number"
                name={"bedroom"}
                label={"اتاق خواب"}
                value={bedroom} // Controlled component
                setter={setBedroom}
                isRequired={true}
              />
              <FloatLabel
                type="number"
                name={"year"}
                label={"سال ساخت"}
                value={year} // Controlled component
                setter={setYear}
                isRequired={true}
              />
              <FloatLabel
                type="number"
                name={"floor"}
                label={"طبقه"}
                value={floor} // Controlled component
                setter={setFloor}
                isRequired={true}
              />
              <FloatLabel
                type="number"
                name={"floors"}
                label={"طبقات"}
                value={floors} // Controlled component
                setter={setFloors}
                isRequired={true}
              />
              <FloatLabel
                type="number"
                name={"units"}
                label={"واحد ها"}
                value={units} // Controlled component
                setter={setUnits}
                isRequired={true}
              />
            </>
          )}
          {propertyType === "S" && (
            <>
              <FloatLabel
                type="number"
                name={"year"}
                label={"سال ساخت"}
                value={year} // Controlled component
                setter={setYear}
                isRequired={true}
              />
            </>
          )}
          {propertyType === "H" && (
            <>
              <FloatLabel
                type="number"
                name={"floors"}
                label={"طبقات"}
                value={floors} // Controlled component
                setter={setFloors}
                isRequired={true}
              />
              <FloatLabel
                type="number"
                name={"bedroom"}
                label={"اتاق خواب"}
                value={bedroom} // Controlled component
                setter={setBedroom}
                isRequired={true}
              />
            </>
          )}
        </div>
        <div className="grid grid-cols-1 gap-2">
          <div className="flex gap-2 items-center"> {/* Added items-center */}
            <label
              htmlFor="bazdid"
              className="text-gray-500 text-lg" // Simplified class
            >
              بازدید:
            </label>
            <select
              name="bazdid"
              id="bazdid"
              value={bazdid} // Controlled component
              onChange={(e) => {
                setBazdid(e.target.value);
                // Clear related fields if bazdid changes away from مستاجر/سرایدار
                if (e.target.value !== "مستاجر") {
                    setTenetName("");
                    setTenetPhone("");
                }
                if (e.target.value !== "سرایدار") {
                    setLobbyManName("");
                    setLobbyManPhone("");
                }
              }}
              className="bg-gray-50 border focus:ring-blue-300 text-center focus:border-blue-300 shadow-md w-24 h-10 rounded-lg"
            >
              <option value="هماهنگی">هماهنگی</option>
              <option value="صبح">صبح</option>
              <option value="بعدازظهر">بعدازظهر</option>
              <option value="مستاجر">مستاجر</option>
              <option value="سرایدار">سرایدار</option>
            </select>
          </div>
          {bazdid === "مستاجر" && (
            <div className="flex flex-row gap-2 max-w-sm">
              <FloatLabel
                type="text" // Should be tel for better mobile UX
                name={"tenetPhone"}
                label={"شماره مستاجر"}
                value={tenetPhone} // Controlled component
                setter={setTenetPhone}
                isRequired={true} // Required if bazdid is مستاجر
                maxChars={11}
              />
              <FloatLabel
                type="text"
                name={"tenetName"}
                label={"نام مستاجر"}
                value={tenetName} // Controlled component
                setter={setTenetName}
                isRequired={true} // Required if bazdid is مستاجر
              />
            </div>
          )}
          {bazdid === "سرایدار" && (
            <div className="flex flex-row gap-2 max-w-sm">
              <FloatLabel
                type="text" // Should be tel
                name={"lobbyManPhone"}
                label={"شماره سرایدار"}
                value={lobbyManPhone} // Controlled component
                setter={setLobbyManPhone}
                isRequired={true} // Required if bazdid is سرایدار
                maxChars={11}
              />
              <FloatLabel
                type="text"
                name={"lobbyManName"}
                label={"نام سرایدار"}
                value={lobbyManName} // Controlled component
                setter={setLobbyManName}
                isRequired={true} // Required if bazdid is سرایدار
              />
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 max-w-sm gap-2">
          <FloatLabel
            type="text" // Should be tel
            name={"ownerPhone"}
            label={"شماره مالک"}
            value={ownerPhone} // Controlled component
            setter={setOwnerPhone}
            isRequired={true}
            maxChars={11}
          />
          <FloatLabel
            type="text"
            name={"ownerName"}
            label={"نام مالک"}
            value={ownerName} // Controlled component
            setter={setOwnerName}
            isRequired={true}
          />
        </div>
        <div className="grid grid-cols-1 h-12 gap-2"> {/* Changed to grid-cols-1 for full width */}
          <FloatLabel
            type="text"
            name={"description"}
            label={"توضیحات"}
            value={description} // Controlled component
            setter={setDescription}
            isRequired={false}
          />
        </div>
        <div className="flex h-12 gap-2 items-center"> {/* Added items-center */}
          <input type="file" multiple id="customFileInput" onChange={handleFileChange} className="hidden" />
          <label htmlFor="customFileInput" className="flex cursor-pointer w-32 bg-blue-200 text-black items-center justify-center font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-400 transition duration-150 ease-in-out">
            {selectedFiles && selectedFiles.length > 0 ? `${selectedFiles.length} عکس انتخاب شد` : "انتخاب عکس"}
          </label>
        </div>
        {/* Assuming NewLocation takes 'location' and 'setLocation' or similar props if it needs to be controlled/reset */}
        <NewLocation location={location} setLocation={setLocation} /> {/* Example of passing props */}
        <div className="grid grid-cols-2 sm:grid-cols-4 max-w-md gap-y-1 gap-x-2"> {/* Adjusted grid for checkboxes */}
          <Checkbox label="پارکینگ" name="parking" checked={parking} setter={setParking} />
          <Checkbox label="آسانسور" name="elevator" checked={elevator} setter={setElevator} />
          <Checkbox label="انباری" name="storage" checked={storage} setter={setStorage} />
          <Checkbox label="پارک موتور" name="motorSpot" checked={motorSpot} setter={setMotorSpot} />
        </div>
        <button
          type="submit"
          className="basis-full rounded-lg bg-blue-300 hover:bg-blue-400 py-1.5 border w-full" // Removed bottom-0 as it's not fixed
        >
          ثبت
        </button>
      </form>
    </div>
  );
};

export default NewFile;
