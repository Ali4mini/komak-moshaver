// UpdateCustomer.jsx
import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux"; // Assuming you might want to dispatch flash messages
import { api } from "../common/api";
import { setFlashMessage } from "../common/flashSlice"; // Assuming you have this slice

import FloatLabel from "../common/input";
import Checkbox from "../common/checkbox";
import CustomDatePicker from "../common/datePicker";

// Icons (you can pick and choose or add more as needed)
import {
  UserCircleIcon,
  HomeIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  PencilSquareIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

// Reusable SectionCard component from the reference
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

const UpdateCustomer = () => {
  const navigate = useNavigate();
  const { customerType, id } = useParams(); // 'buy' or 'rent'
  const dispatch = useDispatch();

  const [originalCustomer, setOriginalCustomer] = useState(null);
  const [originalPerson, setOriginalPerson] = useState(null); // For customer's personal details

  const [formData, setFormData] = useState({
    property_type: "A", // Default property type for the customer's preference
    m2: "",
    year: "",
    bedroom: "",
    budget: "", // For 'buy' customerType
    up_budget: "", // For 'rent' customerType (deposit)
    rent_budget: "", // For 'rent' customerType (monthly rent)
    vahedha: "", // 'units' from your original component, assuming it means units per floor or similar
    parking: false,
    elevator: false,
    storage: false,
    parking_motor: false,
    // Customer's own details (if they are not a separate 'Person' entity or if you want to edit them here)
    // These were 'customer_name' and 'customer_phone' in your original component.
    // If 'customer' field in the response points to a Person ID, these might be display-only or not directly editable here.
    // For now, assuming these are part of the customer's preference record directly.
    customer_date: new Date().toISOString().split("T")[0], // Date preference was registered
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Consistent select class
  const selectClassName = "w-full bg-slate-50 border border-slate-300 text-slate-700 text-sm rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500";


  useEffect(() => {
    setIsLoading(true);
    setError(null);

    const fetchAllData = async () => {
      try {
        // Fetch the main customer preference record
        const customerRes = await api.get(`customer/${customerType}/${id}/`);
        const fetchedCustomerData = customerRes.data;
        setOriginalCustomer(fetchedCustomerData);

        setFormData({
            property_type: fetchedCustomerData.property_type || "A",
            m2: fetchedCustomerData.m2 || "",
            year: fetchedCustomerData.year || "",
            bedroom: fetchedCustomerData.bedroom || "",
            budget: fetchedCustomerData.budget || "",
            up_budget: fetchedCustomerData.up_budget || "",
            rent_budget: fetchedCustomerData.rent_budget || "",
            vahedha: fetchedCustomerData.vahedha || "", // Assuming this was 'units'
            parking: fetchedCustomerData.parking || false,
            elevator: fetchedCustomerData.elevator || false,
            storage: fetchedCustomerData.storage || false,
            parking_motor: fetchedCustomerData.parking_motor || false,
            // customer_name: fetchedCustomerData.customer_name || "", // From original
            // customer_phone: fetchedCustomerData.customer_phone || "", // From original
	    customer: fetchedCustomerData.customer,
            customer_date: fetchedCustomerData.customer_date || new Date().toISOString().split("T")[0],
        });

        // If the customer record has a 'customer' field pointing to a Person ID
        if (fetchedCustomerData.customer) {
          try {
            const personRes = await api.get(`common/persons/${fetchedCustomerData.customer}`);
            setOriginalPerson(personRes.data);
            // You might want to update formData with person details if they are editable here,
            // or just use originalPerson for display.
            // For now, assuming customer_name and customer_phone in formData are the ones to be edited if they are part of the customer preference record.
          } catch (personErr) {
             console.warn("Error fetching person details for customer:", personErr.response?.data || personErr.message);
             // Set originalPerson to null or an empty object if needed
          }
        }

      } catch (err) {
        console.error("Error fetching customer details:", err.response?.data || err.message);
        setError(err.response?.status === 404 ? `متقاضی با شناسه ${id} یافت نشد.` : "خطا در بارگذاری اطلاعات متقاضی.");
      } finally {
        setIsLoading(false);
      }
    };

    if (id && customerType) {
      fetchAllData();
    } else {
      setError("شناسه متقاضی یا نوع متقاضی نامعتبر است.");
      setIsLoading(false);
    }
  }, [customerType, id]);

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
      customer_date: isoDateStringOrNull, // Ensure your date field name matches
    }));
  };
  
  // Setter for FloatLabel components
  const handleFloatLabelChange = (name, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (formData.customer_phone && formData.customer_phone.length !== 11) {
      setError("شماره تلفن متقاضی باید ۱۱ رقم باشد.");
      setIsSubmitting(false);
      if (dispatch) dispatch(setFlashMessage({ type: "ERROR", message: "شماره تلفن متقاضی باید ۱۱ رقم باشد." }));
      return;
    }

    const payload = { ...formData };
    
    // Convert empty strings for numbers to null or a backend-expected default if necessary
    const numericFields = ['m2', 'year', 'bedroom', 'budget', 'up_budget', 'rent_budget', 'vahedha'];
    numericFields.forEach(key => {
        if (payload[key] === "") {
            payload[key] = null; // Or "0" or skip if backend handles empty string as null
        } else if (payload[key] !== null) {
            payload[key] = String(payload[key]); // Ensure it's a string if backend expects strings for numbers
        }
    });
    
    // Ensure boolean fields are booleans
    ['parking', 'elevator', 'storage', 'parking_motor'].forEach(key => {
        payload[key] = Boolean(payload[key]);
    });

    // Add customer_type to the payload for the PATCH request
    payload.customer_type = customerType;

    try {
      await api.patch(`customer/${customerType}/${id}/`, payload);
      if (dispatch) dispatch(setFlashMessage({ type: "SUCCESS", message: "اطلاعات متقاضی با موفقیت بروزرسانی شد." }));
      navigate(`/customer/${customerType}/${id}/`, { replace: true }); // Navigate to customer detail page
    } catch (err) {
      const apiErrorMsg = err.response?.data?.detail || err.response?.data || err.message;
      setError(`خطا در ذخیره تغییرات: ${apiErrorMsg || "لطفا ورودی ها را بررسی کنید."}`);
      if (dispatch) dispatch(setFlashMessage({ type: "ERROR", message: `خطا در بروزرسانی: ${apiErrorMsg}` }));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading && !originalCustomer) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500"></div>
        <p className="mt-4 text-lg text-gray-700">در حال بارگذاری اطلاعات متقاضی...</p>
      </div>
    );
  }

  if (error && !originalCustomer) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-6 text-center bg-gray-100">
        <ExclamationTriangleIcon className="w-20 h-20 text-red-500 mb-6" />
        <h2 className="text-2xl font-semibold text-red-700 mb-3">خطا</h2>
        <p className="text-gray-600 mb-8 max-w-md">{error}</p>
        <button onClick={() => navigate("/customers")} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
          بازگشت به لیست متقاضیان
        </button>
      </div>
    );
  }
  
  if (!originalCustomer && !isLoading) { 
    return (
        <div className="flex flex-col items-center justify-center h-screen p-6 text-center bg-gray-100">
            <InformationCircleIcon className="w-20 h-20 text-orange-500 mb-6" />
            <h2 className="text-2xl font-semibold text-orange-700 mb-3">متقاضی یافت نشد</h2>
            <p className="text-gray-600 mb-8">اطلاعات این متقاضی برای ویرایش در دسترس نیست.</p>
            <button onClick={() => navigate("/customers")} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
             بازگشت به لیست متقاضیان
            </button>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6 lg:p-8">
      <form onSubmit={handleSubmit}>
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            ویرایش اطلاعات متقاضی <span className="text-gray-500 font-normal">(کد: {id})</span>
          </h1>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => navigate(`/customer/${customerType}/${id}`)} // Navigate back to customer detail
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
        
        {error && !isSubmitting && ( // Show submission errors here
            <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md text-sm whitespace-pre-wrap">
                {error}
            </div>
        )}

        {/* --- Main content area with SectionCards --- */}
        <div className="space-y-6"> {/* Single column layout for simplicity, can be multi-column if needed */}
            {/* --- اطلاعات کلی متقاضی --- */}
            <SectionCard 
                title="اطلاعات کلی و تماس متقاضی" 
                icon={<UserCircleIcon className="w-6 h-6" />} 
                contentClassName="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-5"
            >
                <div>
                    <label htmlFor="customer_type_display" className="block mb-1.5 text-sm font-medium text-gray-600">نوع متقاضی:</label>
                    <input 
                        type="text" 
                        id="customer_type_display"
                        value={customerType === 'buy' ? 'متقاضی خرید' : 'متقاضی اجاره'} 
                        disabled 
                        className={`${selectClassName} bg-slate-100 cursor-not-allowed`}
                    />
                </div>
                {/* Display Person Info if available and not directly editable here */}
                {originalPerson ? (
                    <>
                        <FloatLabel label="نام ثبت شده متقاضی" name="original_person_name_display" value={`${originalPerson.first_name || ""} ${originalPerson.last_name || ""}`.trim() || "---"} isDisabled={true} inputClassName="bg-slate-100"/>
                        <FloatLabel label="شماره ثبت شده متقاضی" name="original_person_phone_display" value={originalPerson.phone_number || "---"} isDisabled={true} inputClassName="bg-slate-100"/>
                    </>
                ) : (
                    <>
                         {/* If originalPerson is not fetched, allow editing these if they are part of the customer preference */}
                        <FloatLabel label="نام متقاضی (در صورت نیاز)" name="customer_name" value={formData.customer_name || ""} setter={(val) => handleFloatLabelChange("customer_name", val)} />
                        <FloatLabel label="شماره متقاضی (در صورت نیاز)" name="customer_phone" value={formData.customer_phone || ""} setter={(val) => handleFloatLabelChange("customer_phone", val)} type="tel" />
                    </>
                )}
                <div>
                    <label htmlFor="customer_date_picker_id" className="block mb-1.5 text-sm font-medium text-gray-600">تاریخ ثبت تقاضا:</label>
                    <CustomDatePicker 
                        id="customer_date_picker_id"
                        setter={handleDateChange} 
                        defaultDate={originalCustomer.customer_date} // Use formData for controlled component
                    />
                </div>
            </SectionCard>
            
            {/* --- مشخصات ملک مورد نظر --- */}
            <SectionCard 
                title="مشخصات ملک مورد نظر" 
                icon={<HomeIcon className="w-6 h-6" />} 
                contentClassName="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-5"
            >
                <div>
                    <label htmlFor="uc_property_type" className="block mb-1.5 text-sm font-medium text-gray-600">نوع ملک:</label>
                    <select id="uc_property_type" name="property_type" value={formData.property_type || 'A'} onChange={handleChange} className={selectClassName}>
                        <option value="A">آپارتمان</option>
                        <option value="L">زمین</option>
                        <option value="S">مغازه</option>
                        <option value="H">خانه و ویلا</option>
                        {/* Add other types if applicable */}
                    </select>
                </div>

                {customerType === "buy" ? (
                    <FloatLabel label="بودجه خرید (تومان)" name="budget" value={formData.budget || ''} setter={(val) => handleFloatLabelChange("budget", val)} type="number" isRequired={true}/>
                ) : (
                    <>
                        <FloatLabel label="ودیعه (تومان)" name="up_budget" value={formData.up_budget || ''} setter={(val) => handleFloatLabelChange("up_budget", val)} type="number" isRequired={true}/>
                        <FloatLabel label="اجاره ماهانه (تومان)" name="rent_budget" value={formData.rent_budget || ''} setter={(val) => handleFloatLabelChange("rent_budget", val)} type="number" isRequired={true}/>
                    </>
                )}
                <FloatLabel label="متراژ مدنظر (مترمربع)" name="m2" value={formData.m2 || ''} setter={(val) => handleFloatLabelChange("m2", val)} type="number" />
                
                {/* Conditional fields based on propertyType (similar to Filter component) */}
                {formData.property_type !== "L" && ( // Not for زمین
                    <FloatLabel label="سال ساخت مدنظر (حداکثر)" name="year" value={formData.year || ''} setter={(val) => handleFloatLabelChange("year", val)} type="number" />
                )}
                {(formData.property_type === "A" || formData.property_type === "H") && ( // Only for آپارتمان & خانه و ویلا
                    <FloatLabel label="تعداد اتاق خواب مدنظر" name="bedroom" value={formData.bedroom || ''} setter={(val) => handleFloatLabelChange("bedroom", val)} type="number" />
                )}
                 {/* 'vahedha' - Assuming this is like 'units per floor' or similar */}
                <FloatLabel label="تعداد واحدها (اختیاری)" name="vahedha" value={formData.vahedha || ''} setter={(val) => handleFloatLabelChange("vahedha", val)} type="number" />
            </SectionCard>

            {/* --- امکانات مورد نظر --- */}
            {formData.property_type !== "L" && ( // Amenities not typically for "زمین"
                <SectionCard 
                    title="امکانات مورد نظر" 
                    icon={<CheckCircleIcon className="w-6 h-6 text-green-500" />} 
                    contentClassName="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
                >
                    <Checkbox label="پارکینگ" name="parking" isChecked={formData.parking || false} setter={(val) => setFormData(p=>({...p, parking: val}))} />
                    <Checkbox label="آسانسور" name="elevator" isChecked={formData.elevator || false} setter={(val) => setFormData(p=>({...p, elevator: val}))} />
                    <Checkbox label="انباری" name="storage" isChecked={formData.storage || false} setter={(val) => setFormData(p=>({...p, storage: val}))} />
                    <Checkbox label="پارکینگ موتور" name="parking_motor" isChecked={formData.parking_motor || false} setter={(val) => setFormData(p=>({...p, parking_motor: val}))} />
                </SectionCard>
            )}
        </div>
      </form>
    </div>
  );
};

export default UpdateCustomer;
