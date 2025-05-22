import FloatLabel from "../common/input";
import Checkbox from "../common/checkbox";
import { useState, useEffect } from "react";
import { api } from "../common/api";
import { setFlashMessage } from "../common/flashSlice";
import { useDispatch } from "react-redux";
import NewLocation from "../common/newLocation.jsx";
import CustomDatePicker from "../common/datePicker";

const NewFile = () => {
  const initialFileType = (localStorage.getItem("agents_field") || "sell").toLowerCase();
  const initialDate = new Date().toISOString().split("T")[0];

  const [fileType, setFileType] = useState(initialFileType);
  const [propertyType, setPropertyType] = useState("A");
  const [address, setAddress] = useState("");
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

  const [location, setLocation] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState(null);
  const user = localStorage.getItem("user");
  const dispatch = useDispatch();

  // ADD THIS STATE FOR THE KEY
  const [formInstanceKey, setFormInstanceKey] = useState(Date.now());

  const resetForm = () => {
    setFileType((localStorage.getItem("agents_field") || "sell").toLowerCase());
    setPropertyType("A");
    setAddress(""); setM2(""); setYear(""); setBedroom("");
    setPrice(""); setUpPrice(""); setRentPrice("");
    setHasTabdil("no"); setTabdil("");
    setFloor(""); setFloors(""); setUnits("");
    setParking(false);
    setElevator(false);
    setStorage(false);
    setMotorSpot(false);
    setOwnerName(""); setOwnerPhone("");
    setBazdid("هماهنگی");
    setTenetPhone(""); setTenetName("");
    setLobbyManName(""); setLobbyManPhone("");
    setDescription("");
    setDate(new Date().toISOString().split("T")[0]);
    setLocation(null);
    setSelectedFiles(null);
    const fileInput = document.getElementById('customFileInput');
    if (fileInput) fileInput.value = null;
    // UPDATE THE KEY TO FORCE RE-MOUNT OF CHECKBOXES
    setFormInstanceKey(Date.now());
  };

  const handleLocation = async (fileTypeRes, fileIdRes, loc) => {
    if (!loc) return;
    const data = { location: loc, file: fileIdRes };
    return await api.post(`file/${fileTypeRes}/${fileIdRes}/location/`, data);
  };

  const handleUpload = async (endpoint) => {
    if (!selectedFiles || selectedFiles.length === 0) return;
    const formData = new FormData();
    Array.from(selectedFiles).forEach((file) => formData.append('images', file));
    try {
      await api.post(endpoint, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    } catch (error) {
      dispatch(setFlashMessage({ type: "ERROR", message: `فایل ثبت شد اما آپلود عکس ناموفق بود: ${error.message || 'خطای سرور'}` }));
    }
  };

  const create = async (event) => {
    event.preventDefault();
    let fileEnteryData = {
      username: user, file_type: fileType, property_type: propertyType, date: date, updated: date,
      address: address, m2: m2 ? Number(m2) : null, year: year ? Number(year) : null,
      bedroom: bedroom ? Number(bedroom) : null, price: price ? Number(price) : null,
      price_up: upPrice ? Number(upPrice) : null, price_rent: rentPrice ? Number(rentPrice) : null,
      tabdil: tabdil ? Number(tabdil) : null, floor: floor ? Number(floor) : null,
      tabaghat: floors ? Number(floors) : null, vahedha: units ? Number(units) : null,
      parking: Boolean(parking),
      elevator: Boolean(elevator),
      storage: Boolean(storage),
      parking_motor: Boolean(motorSpot),
      owner_name: ownerName, owner_phone: ownerPhone, bazdid: bazdid,
      tenet_name: tenetName || null, tenet_phone: tenetPhone || null,
      lobbyMan_name: lobbyManName || null, lobbyMan_phone: lobbyManPhone || null,
      description: description || null,
    };

    if (fileType === "sell") {
      delete fileEnteryData.price_up; delete fileEnteryData.price_rent; delete fileEnteryData.tabdil;
    } else if (fileType === "rent") {
      delete fileEnteryData.price;
    }

    if (!ownerPhone || ownerPhone.length !== 11) { alert("شماره تلفن مالک الزامی و باید ۱۱ رقم باشد."); return; }
    if (!ownerName) { alert("نام مالک الزامی است."); return; }
    if (!address) { alert("آدرس الزامی است."); return; }
    if (!m2) { alert("متراژ الزامی است."); return; }
    if (tenetPhone && tenetPhone.length !== 11) { alert("شماره تلفن مستاجر در صورت ورود باید ۱۱ رقم باشد."); return; }
    if (lobbyManPhone && lobbyManPhone.length !== 11) { alert("شماره تلفن سرایدار در صورت ورود باید ۱۱ رقم باشد."); return; }

    try {
      const response = await api.post(`file/${fileEnteryData.file_type}/new/`, fileEnteryData);
      if (response.status === 201) {
        const fileId = response.data["id"];
        const createdFileType = response.data["file_type"];
        await handleLocation(createdFileType, fileId, location);
        if (selectedFiles && selectedFiles.length > 0) {
          await handleUpload(`file/${createdFileType}/${fileId}/images/`);
        }
        dispatch(setFlashMessage({ type: "SUCCESS", message: `یک فایل با موفقیت اضافه شد \n کد: ${fileId}` }));
        resetForm();
      } else {
        dispatch(setFlashMessage({ type: "WARNING", message: `فایل ثبت شد اما با وضعیت غیرمنتظره: ${response.status}` }));
        resetForm();
      }
    } catch (error) {
      dispatch(setFlashMessage({ type: "ERROR", message: `خطا در ثبت فایل: ${error.response?.data?.detail || error.message || 'لطفا دوباره تلاش کنید.'}` }));
    }
  };

  const handleFileChange = (event) => setSelectedFiles(event.target.files);

  useEffect(() => {
    if (fileType === "sell") {
      setUpPrice(""); setRentPrice(""); setHasTabdil("no"); setTabdil("");
    } else if (fileType === "rent") {
      setPrice("");
    }
  }, [fileType]);

  const selectClasses = "block w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-center";

  return (
    <div className="max-w-5xl mx-auto p-6 sm:p-8 bg-white shadow-xl rounded-2xl my-8 ">
      <h1 className="text-3xl font-bold text-gray-800 mb-10 text-center">ثبت فایل جدید</h1>
      <form onSubmit={create} className="space-y-10">
        <fieldset className="p-6 border border-gray-300 rounded-lg">
          <legend className="text-lg font-medium text-indigo-600 px-2">اطلاعات پایه</legend>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-8 items-end mt-4">
            <div>
              <label htmlFor="file_type" className="block text-sm font-medium text-gray-700 mb-1">نوع قرارداد</label>
              <select id="file_type" value={fileType} onChange={(e) => setFileType(e.target.value)} className={selectClasses}>
                <option value="sell">فروش</option>
                <option value="rent">اجاره</option>
              </select>
            </div>
            <div>
              <label htmlFor="property_type" className="block text-sm font-medium text-gray-700 mb-1">نوع ملک</label>
              <select id="property_type" value={propertyType} onChange={(e) => setPropertyType(e.target.value)} className={selectClasses}>
                <option value="A">آپارتمان</option>
                <option value="L">زمین</option>
                <option value="S">مغازه</option>
                <option value="H">خانه و ویلا</option>
              </select>
            </div>
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">تاریخ ثبت</label>
              <div style={{ direction: "rtl" }}>
                <CustomDatePicker date={date} setter={setDate} inputClassName={selectClasses} />
              </div>
            </div>
          </div>
        </fieldset>

        <fieldset className="p-6 border border-gray-300 rounded-lg">
          <legend className="text-lg font-medium text-indigo-600 px-2">مشخصات ملک</legend>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-8">
            <div className="sm:col-span-2 md:col-span-3">
              <FloatLabel type="text" name="address" label="آدرس دقیق ملک" value={address} setter={setAddress} isRequired={true} />
            </div>

            {fileType === "sell" ? (
              <FloatLabel type="number" name="price" label="قیمت کل (تومان)" value={price} setter={setPrice} isRequired={true} />
            ) : (
              <>
                <FloatLabel type="number" name="upPrice" label="مبلغ ودیعه (تومان)" value={upPrice} setter={setUpPrice} isRequired={true} />
                <FloatLabel type="number" name="rentPrice" label="مبلغ اجاره (تومان)" value={rentPrice} setter={setRentPrice} isRequired={true} />
                <div>
                  <label htmlFor="hasTabdil" className="block text-sm font-medium text-gray-700 mb-1">قابلیت تبدیل</label>
                  <select id="hasTabdil" value={hasTabdil} onChange={(e) => { setHasTabdil(e.target.value); if (e.target.value === "no") setTabdil(""); }} className={selectClasses}>
                    <option value="no">ندارد</option>
                    <option value="yes">دارد</option>
                  </select>
                </div>
                {hasTabdil === "yes" && (
                  <FloatLabel type="number" name="tabdil" label="تبدیل تا (تومان)" value={tabdil} setter={setTabdil} />
                )}
              </>
            )}
            <FloatLabel type="number" name="m2" label="متراژ (متر مربع)" value={m2} setter={setM2} isRequired={true} />

            {propertyType === "A" && (
              <>
                <FloatLabel type="number" name="bedroom" label="تعداد اتاق خواب" value={bedroom} setter={setBedroom} isRequired={true} />
                <FloatLabel type="number" name="year" label="سال ساخت" value={year} setter={setYear} isRequired={true} />
                <FloatLabel type="number" name="floor" label="طبقه" value={floor} setter={setFloor} isRequired={true} />
                <FloatLabel type="number" name="floors" label="تعداد کل طبقات" value={floors} setter={setFloors} isRequired={true} />
                <FloatLabel type="number" name="units" label="تعداد واحد در طبقه" value={units} setter={setUnits} isRequired={true} />
              </>
            )}
            {propertyType === "S" && (
              <FloatLabel type="number" name="year" label="سال ساخت" value={year} setter={setYear} isRequired={true} />
            )}
            {propertyType === "H" && (
              <>
                <FloatLabel type="number" name="floors" label="تعداد طبقات ویلا" value={floors} setter={setFloors} isRequired={true} />
                <FloatLabel type="number" name="bedroom" label="تعداد اتاق خواب" value={bedroom} setter={setBedroom} isRequired={true} />
              </>
            )}
          </div>
        </fieldset>

        <fieldset className="p-6 border border-gray-300 rounded-lg">
          <legend className="text-lg font-medium text-indigo-600 px-2">اطلاعات مالک و بازدید</legend>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-8">
            <FloatLabel type="tel" name="ownerPhone" label="شماره مالک" value={ownerPhone} setter={setOwnerPhone} isRequired={true} maxChars={11} inputMode="numeric" pattern="[0-9]*" />
            <FloatLabel type="text" name="ownerName" label="نام مالک" value={ownerName} setter={setOwnerName} isRequired={true} />

            <div className="sm:col-span-2">
                <label htmlFor="bazdid" className="block text-sm font-medium text-gray-700 mb-1">شرایط بازدید</label>
                <select
                    id="bazdid" value={bazdid}
                    onChange={(e) => {
                        setBazdid(e.target.value);
                        if (e.target.value !== "مستاجر") { setTenetName(""); setTenetPhone(""); }
                        if (e.target.value !== "سرایدار") { setLobbyManName(""); setLobbyManPhone(""); }
                    }}
                    className={`${selectClasses} max-w-xs`}
                >
                    <option value="هماهنگی">هماهنگی</option>
                    <option value="صبح">صبح</option>
                    <option value="بعدازظهر">بعدازظهر</option>
                    <option value="مستاجر">با مستاجر</option>
                    <option value="سرایدار">با سرایدار</option>
                </select>
            </div>

            {bazdid === "مستاجر" && (
              <>
                <FloatLabel type="tel" name="tenetPhone" label="شماره مستاجر" value={tenetPhone} setter={setTenetPhone} isRequired={true} maxChars={11} inputMode="numeric" pattern="[0-9]*" />
                <FloatLabel type="text" name="tenetName" label="نام مستاجر" value={tenetName} setter={setTenetName} isRequired={true} />
              </>
            )}
            {bazdid === "سرایدار" && (
              <>
                <FloatLabel type="tel" name="lobbyManPhone" label="شماره سرایدار" value={lobbyManPhone} setter={setLobbyManPhone} isRequired={true} maxChars={11} inputMode="numeric" pattern="[0-9]*" />
                <FloatLabel type="text" name="lobbyManName" label="نام سرایدار" value={lobbyManName} setter={setLobbyManName} isRequired={true} />
              </>
            )}
          </div>
        </fieldset>

        <fieldset className="p-6 border border-gray-300 rounded-lg">
          <legend className="text-lg font-medium text-indigo-600 px-2">اطلاعات تکمیلی</legend>
          <div className="mt-4 space-y-8">
            <div>
              <FloatLabel type="textarea" name="description" label="توضیحات بیشتر (اختیاری)" value={description} setter={setDescription} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">تصاویر ملک (اختیاری)</label>
              <input type="file" multiple id="customFileInput" onChange={handleFileChange} className="hidden" />
              <label htmlFor="customFileInput" className="flex items-center justify-center w-full sm:w-auto sm:max-w-md cursor-pointer bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold py-3 px-4 rounded-lg border-2 border-dashed border-indigo-300 transition duration-150 ease-in-out">
                {selectedFiles && selectedFiles.length > 0 ? `${selectedFiles.length} عکس انتخاب شد` : "برای انتخاب عکس کلیک کنید"}
              </label>
               {selectedFiles && selectedFiles.length > 0 && (
                <div className="mt-2 text-xs text-gray-500">
                  فایل‌های انتخاب شده: {Array.from(selectedFiles).map(f => f.name).join(', ')}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">موقعیت روی نقشه (اختیاری)</label>
              <NewLocation location={location} setLocation={setLocation} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">امکانات ملک</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-3">
                <Checkbox
                  key={`parking-${formInstanceKey}`}
                  label="پارکینگ"
                  name="parking"
                  isChecked={parking}
                  setter={setParking}
                />
                <Checkbox
                  key={`elevator-${formInstanceKey}`}
                  label="آسانسور"
                  name="elevator"
                  isChecked={elevator}
                  setter={setElevator}
                />
                <Checkbox
                  key={`storage-${formInstanceKey}`}
                  label="انباری"
                  name="storage"
                  isChecked={storage}
                  setter={setStorage}
                />
                <Checkbox
                  key={`motorSpot-${formInstanceKey}`}
                  label="پارکینگ موتور"
                  name="motorSpot"
                  isChecked={motorSpot}
                  setter={setMotorSpot}
                />
              </div>
            </div>
          </div>
        </fieldset>

        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75 text-lg"
        >
          ثبت فایل
        </button>
      </form>
    </div>
  );
};

export default NewFile;
