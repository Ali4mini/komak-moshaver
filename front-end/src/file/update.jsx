// src/forms/FileEditForm.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { api, media } from "../common/api";
import { setFlashMessage } from "../common/flashSlice";

import FloatLabel from "../common/input";
import Checkbox from "../common/checkbox";
import CustomDatePicker from "../common/datePicker";

import {
  BuildingOffice2Icon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  PencilSquareIcon,
  PhotoIcon,
  TagIcon,
  UserCircleIcon,
  HomeIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowUpOnSquareIcon,
  TrashIcon,
  PlusCircleIcon,
} from "@heroicons/react/24/outline";

const SectionCard = ({ title, children, icon, titleClassName = "", contentClassName="" }) => (
  <div className="bg-white shadow-xl rounded-xl p-5 md:p-6 mb-6">
    {title && (
      <div className="flex items-center mb-5 border-b border-gray-200 pb-3">
        {icon && <div className="me-3 text-indigo-600">{icon}</div>}
        <h2 className={`text-lg font-semibold text-gray-700 ${titleClassName}`}>
          {title}
        </h2>
      </div>
    )}
    <div className={contentClassName}>{children}</div>
  </div>
);

const FileEditForm = () => {
  const navigate = useNavigate();
  const { fileType, id } = useParams();
  const dispatch = useDispatch();

  const [originalFile, setOriginalFile] = useState(null);
  const [originalOwner, setOriginalOwner] = useState(null);
  const [originalImages, setOriginalImages] = useState([]);
  const [originalLocation, setOriginalLocation] = useState(null);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])

  const [formData, setFormData] = useState({
    property_type: "A",
    address: "",
    m2: "",
    year: "",
    bedroom: "",
    price: "",
    price_up: "",
    price_rent: "",
    tabdil: null,
    floor: "",
    tabaghat: "",
    vahedha: "",
    parking: false,
    elevator: false,
    storage: false,
    parking_motor: false,
    komod_divari: false,
    bazdid: "هماهنگی",
    tenet_name: "",
    tenet_phone: "",
    description: "",
    date: null, 
    status: "ACTIVE",
  });
  const [ownerData, setOwnerData] = useState({});

  const [newImages, setNewImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [newLocationImage, setNewLocationImage] = useState(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    setOriginalImages([]); 

    const fetchAllData = async () => {
      try {
        const fileResponse = await api.get(`file/${fileType}/${id}/`);
        const fetchedFileData = fileResponse.data;
        setOriginalFile(fetchedFileData);
        
        setFormData({
            property_type: fetchedFileData.property_type || "A",
            address: fetchedFileData.address || "",
            m2: fetchedFileData.m2 || "", // Keep as string from backend or empty string
            year: fetchedFileData.year || "",
            bedroom: fetchedFileData.bedroom || "",
            price: fetchedFileData.price || "",
            price_up: fetchedFileData.price_up || "",
            price_rent: fetchedFileData.price_rent || "",
            tabdil: fetchedFileData.tabdil || null,
            floor: fetchedFileData.floor || "",
            tabaghat: fetchedFileData.tabaghat || "",
            vahedha: fetchedFileData.vahedha || "",
            parking: fetchedFileData.parking || false,
            elevator: fetchedFileData.elevator || false,
            storage: fetchedFileData.storage || false,
            parking_motor: fetchedFileData.parking_motor || false,
            komod_divari: fetchedFileData.komod_divari || false,
            bazdid: fetchedFileData.bazdid || "هماهنگی",
            tenet_name: fetchedFileData.tenet_name || "",
            tenet_phone: fetchedFileData.tenet_phone || "",
            description: fetchedFileData.description || "",
            date: fetchedFileData.date || null, 
            status: fetchedFileData.status || "ACTIVE",
        });

        if (fetchedFileData.owner) {
          const ownerRes = await api.get(`common/persons/${fetchedFileData.owner}`);
          setOriginalOwner(ownerRes.data);
          setOwnerData(ownerRes.data);
        }

        try {
            const imagesRes = await api.get(`file/${fileType}/${id}/images/`);
            const imagesWithClientIds = (Array.isArray(imagesRes.data) ? imagesRes.data : []).map((img, index) => ({
                ...img,
                _clientId: img.id || img.image_url || `client-img-${index}` 
            }));
            setOriginalImages(imagesWithClientIds);
        } catch (imgErr) {
            if (imgErr.response && imgErr.response.status === 404) {
                setOriginalImages([]);
            } else {
                console.warn("Error fetching images:", imgErr.response?.data || imgErr.message);
                setOriginalImages([]);
            }
        }

        try {
            const locationRes = await api.get(`file/${fileType}/${id}/location/`);
            setOriginalLocation(locationRes.data);
        } catch (locErr) {
            if (locErr.response && locErr.response.status === 404) {
                setOriginalLocation(null);
            } else {
                console.warn("Error fetching location:", locErr.response?.data || locErr.message);
            }
        }

      } catch (err) {
        console.error("Error fetching file details:", err.response?.data || err.message);
        setError(err.response?.status === 404 ? `فایل با شناسه ${id} یافت نشد.` : "خطا در بارگذاری اطلاعات فایل.");
      } finally {
        setIsLoading(false);
      }
    };

    if (id && fileType) {
      fetchAllData();
    } else {
      setError("شناسه فایل یا نوع فایل نامعتبر است.");
      setIsLoading(false);
    }
  }, [fileType, id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleDateChange = (isoDateStringOrNull) => {
    setFormData((prevData) => ({
      ...prevData,
      date: isoDateStringOrNull,
    }));
  };
  
  const handleNewImageChange = (event) => {
    setNewImages(Array.from(event.target.files));
  };

  const requestImageDeletion = (imageId) => {
    if (!imageId) return;
    setImagesToDelete(prev => [...prev, imageId]);
    setOriginalImages(prev => prev.filter(img => img.id !== imageId));
  };

  const handleNewLocationImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
        setNewLocationImage(event.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    let overallSuccess = true;
    const errorMessages = [];

    // Create a mutable copy of formData to prepare the payload
    const payload = { ...formData };

    // Define fields that are numeric and might need conversion from empty string to a default (e.g., 0 or backend specific default)
    // or just ensure they are strings if the backend expects that.
    // For now, let's assume backend expects empty string for non-provided optional numbers, or a specific string like "0".
    // If backend requires actual numbers for numeric fields, convert them here (e.g., parseFloat or parseInt).
    const numericFields = ['m2', 'year', 'bedroom', 'price', 'price_up', 'price_rent', 'floor', 'tabaghat', 'vahedha'];
    
    numericFields.forEach(key => {
        if (payload[key] === null || payload[key] === undefined || String(payload[key]).trim() === "") {
            // MODIFICATION: If backend CANNOT handle null and needs empty string or '0'
            // Option A: Send empty string if the field is truly optional and can be empty string
            payload[key] = ""; 
            // Option B: Send a default numeric string like "0" if backend expects that for numbers
            // payload[key] = "0"; // Uncomment and use if backend needs "0" for empty numbers
        } else {
            // Ensure it's a string if it came from a number input but backend expects string
            payload[key] = String(payload[key]);
        }
    });

    // Ensure specific important fields like price_rent are not empty if required, or set a default.
    // Example for price_rent if it's for a 'rent' fileType and cannot be empty string:
    if (fileType === 'rent') {
        if (payload.price_rent === "") {
            // Decide what to send if it's empty: '0' or trigger validation.
            // For now, let's assume '0' if your backend handles it as "no rent defined"
            // This is a business logic decision.
            payload.price_rent = "0"; // Or handle validation: setError("Rent price is required"); return;
        }
        if (payload.price_up === "") {
            payload.price_up = "0"; // Similar for deposit
        }
    }
    if (fileType === 'sell' && payload.price === "") {
        payload.price = "0"; // For sell price
    }


    // Handle date: if it's null, send an empty string if backend expects that.
    // Your CustomDatePicker already sends null if no date is selected.
    if (payload.mate === null) {
        payload.date = ""; // MODIFICATION: Convert null date to empty string
    }

    // Ensure boolean fields are actual booleans (though form data usually handles this well)
    ['parking', 'elevator', 'storage', 'parking_motor', 'komod_divari'].forEach(key => {
        payload[key] = Boolean(payload[key]);
    });

    // Clean up any temporary client-side IDs from payload if they were added
    // (Not strictly necessary if payload is built from formData which shouldn't have them)
    // delete payload._clientId; // Example if _clientId was part of formData

    console.log("[handleSubmit] Preparing payload:", payload);


    try {
      console.log("[handleSubmit] Patching file data...", payload);
      await api.patch(`file/${fileType}/${id}/`, payload);
      console.log("[handleSubmit] File data patched successfully.");

      if (imagesToDelete.length > 0) {
        console.log("[handleSubmit] Attempting to delete images with IDs:", imagesToDelete);
        for (const imageIdToDelete of imagesToDelete) {
          try {
            console.log(`[handleSubmit] Sending DELETE request for image ID: ${imageIdToDelete}`);
            await api.delete(`file/${fileType}/${id}/images/${imageIdToDelete}/`);
            console.log(`[handleSubmit] Image ${imageIdToDelete} deletion request sent successfully.`);
          } catch (deleteErr) {
            console.error(`[handleSubmit] Failed to delete image ${imageIdToDelete}:`, deleteErr.response?.data || deleteErr.message);
            errorMessages.push(`Failed to delete image ${imageIdToDelete}: ${deleteErr.response?.data?.detail || deleteErr.message}`);
            overallSuccess = false;
          }
        }
        setImagesToDelete([]);
      }

      if (newImages.length > 0) {
        console.log("[handleSubmit] Uploading new images...");
        const imageFormData = new FormData();
        newImages.forEach((file) => imageFormData.append("images", file));
        await api.post(`file/${fileType}/${id}/images/`, imageFormData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        console.log("[handleSubmit] New images uploaded successfully.");
        setNewImages([]);
      }
      
      if (newLocationImage) {
        console.log("[handleSubmit] Uploading/updating location image...");
        const locationFormData = new FormData();
        locationFormData.append("image", newLocationImage);
        const endpoint = (originalLocation && originalLocation.id) 
            ? `file/${fileType}/${id}/location/${originalLocation.id}/` 
            : `file/${fileType}/${id}/location/`;
        const method = (originalLocation && originalLocation.id) ? 'patch' : 'post';

        await api[method](endpoint, locationFormData, {
             headers: { "Content-Type": "multipart/form-data" },
        });
        console.log("[handleSubmit] Location image processed successfully.");
        setNewLocationImage(null);
      }

      if (overallSuccess && errorMessages.length === 0) {
        if (dispatch) dispatch(setFlashMessage({ type: "SUCCESS", message: "فایل با موفقیت بروزرسانی شد." }));
        navigate(`/file/${fileType}/${id}/`);
      } else {
        const finalErrorMessage = "بروزرسانی فایل اصلی موفقیت آمیز بود، اما برخی عملیات جانبی با خطا مواجه شدند:\n" + errorMessages.join("\n");
        setError(finalErrorMessage);
        if (dispatch) dispatch(setFlashMessage({ type: "WARNING", message: "برخی عملیات با خطا مواجه شد. جزئیات در صفحه ویرایش." }));
      }

    } catch (err) {
      console.error("[handleSubmit] Critical error during form submission:", err.response?.data || err.message);
      const apiErrorMsg = err.response?.data?.detail || err.response?.data?.image || err.message;
      setError(`خطا در ذخیره تغییرات اصلی: ${apiErrorMsg || "لطفا ورودی ها را بررسی کنید."}`);
      if (dispatch) dispatch(setFlashMessage({ type: "ERROR", message: `خطا در بروزرسانی فایل: ${apiErrorMsg}` }));
      overallSuccess = false;
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading && !originalFile) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500"></div>
        <p className="mt-4 text-lg text-gray-700">در حال بارگذاری اطلاعات فرم...</p>
      </div>
    );
  }

  if (error && !originalFile) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-6 text-center bg-gray-100">
        <ExclamationTriangleIcon className="w-20 h-20 text-red-500 mb-6" />
        <h2 className="text-2xl font-semibold text-red-700 mb-3">خطا</h2>
        <p className="text-gray-600 mb-8 max-w-md">{error}</p>
        <button onClick={() => navigate("/")} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
          بازگشت به لیست
        </button>
      </div>
    );
  }
  
  if (!originalFile && !isLoading) { 
    return (
        <div className="flex flex-col items-center justify-center h-screen p-6 text-center bg-gray-100">
            <InformationCircleIcon className="w-20 h-20 text-orange-500 mb-6" />
            <h2 className="text-2xl font-semibold text-orange-700 mb-3">فایل یافت نشد</h2>
            <p className="text-gray-600 mb-8">اطلاعات این فایل برای ویرایش در دسترس نیست.</p>
            <button onClick={() => navigate("/")} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
            بازگشت به لیست
            </button>
        </div>
    );
  }

  const selectClassName = "w-full bg-slate-50 border border-slate-300 text-slate-700 text-sm rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2.5";
  const fileInputLabelClass = "flex cursor-pointer items-center justify-center w-full sm:w-auto bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2.5 px-4 rounded-lg shadow-md transition";

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6 lg:p-8">
      <form onSubmit={handleSubmit}>
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            ویرایش فایل <span className="text-gray-500 font-normal">(کد: {id})</span>
          </h1>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => navigate(`/file/${fileType}/${id}`)}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 transition-colors"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto flex items-center justify-center px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md transition"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white me-2"></div>
                  در حال ذخیره...
                </>
              ) : (
                <>
                  <PencilSquareIcon className="w-5 h-5 me-2" />
                  ذخیره تغییرات
                </>
              )}
            </button>
          </div>
        </div>
        
        {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md text-sm whitespace-pre-wrap">
                {error}
            </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* --- اطلاعات اصلی فایل --- */}
            <SectionCard title="اطلاعات اصلی فایل" icon={<InformationCircleIcon className="w-6 h-6" />} contentClassName="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-5">
              <div>
                <label htmlFor="ft_property_type" className="block mb-1.5 text-sm font-medium text-gray-600">نوع ملک:</label>
                <select id="ft_property_type" name="property_type" value={formData.property_type || ''} onChange={handleChange} className={selectClassName}>
                  <option value="A">آپارتمان</option>
                  <option value="L">زمین</option>
                  <option value="S">مغازه</option>
                  <option value="H">خانه و ویلا</option>
                </select>
              </div>
              <div>
                <label htmlFor="file_date_picker_id" className="block mb-1.5 text-sm font-medium text-gray-600">تاریخ ثبت:</label>
                <CustomDatePicker 
                    id="file_date_picker_id"
                    setter={handleDateChange} 
                    defaultDate={originalFile.file_date}
                />
              </div>
              <div>
                <label htmlFor="file_status" className="block mb-1.5 text-sm font-medium text-gray-600">وضعیت فایل:</label>
                 <select id="file_status" name="status" value={formData.status || 'ACTIVE'} onChange={handleChange} className={selectClassName}>
                    <option value="ACTIVE">فعال</option>
                    <option value="SOLD">فروخته شده</option>
                    <option value="RENTED">اجاره رفته</option>
                    <option value="ARCHIVED">آرشیو شده</option>
                </select>
              </div>
              <FloatLabel label="ثبت شده توسط" name="added_by" value={originalFile?.added_by || "---"} isDisabled={true} inputClassName="bg-slate-100"/>
            </SectionCard>

            {/* --- اطلاعات مالک --- */}
            {originalOwner && (
              <SectionCard title="اطلاعات مالک" icon={<UserCircleIcon className="w-6 h-6" />} contentClassName="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-5">
                <FloatLabel label="نام مالک" name="owner_name_display" value={`${ownerData.first_name || ""} ${ownerData.last_name || ""}`.trim() || "---"} isDisabled={true} inputClassName="bg-slate-100"/>
                <FloatLabel label="شماره مالک" name="owner_phone_display" value={ownerData.phone_number || "---"} isDisabled={true} inputClassName="bg-slate-100"/>
              </SectionCard>
            )}
            
            {/* --- مشخصات ملک --- */}
            <SectionCard title="مشخصات ملک" icon={<HomeIcon className="w-6 h-6" />} contentClassName="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-5">
                <FloatLabel label="آدرس" name="address" value={formData.address || ''} setter={(val) => setFormData(p=>({...p, address: val}))} type="textarea" inputClassName="min-h-[70px] md:col-span-full"/>
                <FloatLabel label="متراژ (مترمربع)" name="m2" value={formData.m2 || ''} setter={(val) => setFormData(p=>({...p, m2: val}))} type="number" />
                {fileType === "sell" ? (
                    <FloatLabel label="قیمت کل (تومان)" name="price" value={formData.price || ''} setter={(val) => setFormData(p=>({...p, price: val}))} type="number" />
                ) : (
                    <>
                        <FloatLabel label="ودیعه (تومان)" name="price_up" value={formData.price_up || ''} setter={(val) => setFormData(p=>({...p, price_up: val}))} type="number" />
                        <FloatLabel label="اجاره (تومان)" name="price_rent" value={formData.price_rent || ''} setter={(val) => setFormData(p=>({...p, price_rent: val}))} type="number" />
                    </>
                )}
                 {fileType === "rent" && (
                    <FloatLabel label="مبلغ تبدیل (تومان)" name="tabdil" value={formData.tabdil || ''} setter={(val) => setFormData(p=>({...p, tabdil: val}))} type="number" />
                 )}
                <FloatLabel label="سال ساخت" name="year" value={formData.year || ''} setter={(val) => setFormData(p=>({...p, year: val}))} type="number" />
                <FloatLabel label="طبقه" name="floor" value={formData.floor || ''} setter={(val) => setFormData(p=>({...p, floor: val}))} type="number" />
                <FloatLabel label="تعداد کل طبقات" name="tabaghat" value={formData.tabaghat || ''} setter={(val) => setFormData(p=>({...p, tabaghat: val}))} type="number" />
                <FloatLabel label="تعداد خواب" name="bedroom" value={formData.bedroom || ''} setter={(val) => setFormData(p=>({...p, bedroom: val}))} type="number" />
                <FloatLabel label="واحد در طبقه" name="vahedha" value={formData.vahedha || ''} setter={(val) => setFormData(p=>({...p, vahedha: val}))} type="number" />

                <div>
                  <label htmlFor="fe_bazdid" className="block mb-1.5 text-sm font-medium text-gray-600">وضعیت بازدید:</label>
                  <select id="fe_bazdid" name="bazdid" value={formData.bazdid || 'هماهنگی'} onChange={handleChange} className={selectClassName}>
                        <option value="هماهنگی">هماهنگی</option>
                        <option value="کلید موجود">کلید موجود</option>
                        <option value="صبح">صبح</option>
                        <option value="بعدازظهر">بعدازظهر</option>
                        <option value="مستاجر">هماهنگی با مستاجر</option>
                        <option value="مالک ساکن">مالک ساکن</option>
                  </select>
                </div>
                 {formData.bazdid === "مستاجر" && (
                    <>
                        <FloatLabel label="نام مستاجر" name="tenet_name" value={formData.tenet_name || ''} setter={(val) => setFormData(p=>({...p, tenet_name: val}))} />
                        <FloatLabel label="شماره مستاجر" name="tenet_phone" value={formData.tenet_phone || ''} setter={(val) => setFormData(p=>({...p, tenet_phone: val}))} type="tel" />
                    </>
                )}
                 <FloatLabel label="توضیحات" name="description" value={formData.description || ''} setter={(val) => setFormData(p=>({...p, description: val}))} type="textarea" inputClassName="md:col-span-full min-h-[80px]" />
            </SectionCard>

            {/* --- امکانات ملک --- */}
            <SectionCard title="امکانات ملک" icon={<CheckCircleIcon className="w-6 h-6 text-green-500" />} contentClassName="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                <Checkbox label="پارکینگ" name="parking" isChecked={formData.parking || false} setter={(val) => setFormData(p=>({...p, parking: val}))} />
                <Checkbox label="آسانسور" name="elevator" isChecked={formData.elevator || false} setter={(val) => setFormData(p=>({...p, elevator: val}))} />
                <Checkbox label="انباری" name="storage" isChecked={formData.storage || false} setter={(val) => setFormData(p=>({...p, storage: val}))} />
                <Checkbox label="پارکینگ موتور" name="parking_motor" isChecked={formData.parking_motor || false} setter={(val) => setFormData(p=>({...p, parking_motor: val}))} />
                <Checkbox label="کمد دیواری" name="komod_divari" isChecked={formData.komod_divari || false} setter={(val) => setFormData(p=>({...p, komod_divari: val}))} />
            </SectionCard>
          </div>

          {/* --- Right Column (Images, Location) --- */}
          <div className="lg:col-span-1 space-y-6">
            {/* --- گالری تصاویر --- */}
            <SectionCard title="گالری تصاویر" icon={<PhotoIcon className="w-6 h-6" />}>
              {originalImages.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-2">تصاویر موجود (برای حذف روی عکس کلیک کنید):</p>
                  <div className="grid grid-cols-3 gap-2">
                    {originalImages.map((img) => {
                      if (!img || typeof img.image !== 'string' ) {
                        console.warn("Skipping an image in originalImages due to invalid 'image' property:", img);
                        return <div key={img?._clientId || Math.random()} className="w-full h-24 bg-slate-100 rounded-md flex items-center justify-center text-slate-400 text-xs">تصویر نامعتبر</div>;
                      }
                       if (!img.id) {
                        console.warn("Skipping an image due to missing 'id':", img);
                        return <div key={img?._clientId || Math.random()} className="w-full h-24 bg-slate-100 rounded-md flex items-center justify-center text-slate-400 text-xs">ID نامعتبر</div>;
                      }
                      const imageUrl = img.image.startsWith('http') ? img.image : `${media}${img.image}`;
                      return (
                        <div key={img._clientId} className="relative group cursor-pointer" onClick={() => requestImageDeletion(img.id)}>
                            <img src={imageUrl} alt="ملک" className="w-full h-24 object-cover rounded-md"/>
                            <div className="absolute inset-0 bg-red-500 bg-opacity-0 group-hover:bg-opacity-70 flex items-center justify-center rounded-md transition-opacity">
                                <TrashIcon className="w-6 h-6 text-white opacity-0 group-hover:opacity-100"/>
                            </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
               <label htmlFor="new_images_input" className="block mb-1.5 text-sm font-medium text-gray-600">
                {originalImages.length > 0 || newImages.length > 0 ? "افزودن تصاویر جدید:" : "بارگذاری تصاویر:"}
              </label>
              <label htmlFor="new_images_input" className={fileInputLabelClass}>
                <PlusCircleIcon className="w-5 h-5 me-2" /> انتخاب عکس‌ها
              </label>
              <input type="file" multiple id="new_images_input" onChange={handleNewImageChange} className="hidden" />
              {newImages.length > 0 && <p className="mt-2 text-xs text-gray-500">{newImages.length} تصویر جدید برای آپلود انتخاب شد.</p>}
            </SectionCard>

            {/* --- موقعیت مکانی --- */}
            <SectionCard title="موقعیت مکانی (نقشه)" icon={<MapPinIcon className="w-6 h-6" />}>
                {(originalLocation?.image || newLocationImage) && (
                    <div className="mb-3 aspect-w-16 aspect-h-9 rounded-lg overflow-hidden border border-gray-200">
                        <img 
                            src={newLocationImage ? URL.createObjectURL(newLocationImage) : (originalLocation.image && typeof originalLocation.image === 'string' && originalLocation.image.startsWith('http') ? originalLocation.image : `${media}${originalLocation.image}`)}
                            alt="موقعیت ملک"
                            className="object-cover w-full h-full"
                            onError={(e) => { e.target.style.display='none'; }}
                        />
                    </div>
                )}
              <label htmlFor="new_location_image_input" className="block mb-1.5 text-sm font-medium text-gray-600">
                {originalLocation?.image || newLocationImage ? "تغییر تصویر نقشه:" : "بارگذاری تصویر نقشه:"}
              </label>
              <label htmlFor="new_location_image_input" className={fileInputLabelClass}>
                 <ArrowUpOnSquareIcon className="w-5 h-5 me-2" /> انتخاب فایل نقشه
              </label>
              <input type="file" id="new_location_image_input" accept="image/*" onChange={handleNewLocationImageChange} className="hidden" />
            </SectionCard>
          </div>
        </div>
      </form>
    </div>
  );
};

export default FileEditForm;
