import { useState, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { api } from "../common/api";
import { setFlashMessage } from "../common/flashSlice";
import FloatLabel from "../common/input";
import Checkbox from "../common/checkbox";
import CustomDatePicker from "../common/datePicker";

const CUSTOMER_TYPES = [
  { value: "buy", label: "متقاضی خرید" },
  { value: "rent", label: "متقاضی اجاره" },
];

const PROPERTY_TYPES = [
  { value: "A", label: "آپارتمان" },
  { value: "L", label: "زمین" },
  { value: "S", label: "مغازه" },
  { value: "H", label: "خانه و ویلا" },
];

const getInitialCustomerType = () => {
  return (localStorage.getItem("agents_field") || "sell").toLowerCase() === "sell" ? "buy" : "rent";
};

const initialFormData = {
  customerType: getInitialCustomerType(),
  propertyType: "A",
  m2: "", year: "", bedroom: "", budget: "", upBudget: "", rentBudget: "", units: "",
  parking: false, elevator: false, storage: false, motorSpot: false,
  customerName: "", customerPhone: "", description: "",
  date: new Date().toISOString().split("T")[0],
};

const selectBaseClasses = "block w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm";

const NewCustomer = () => {
  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const user = localStorage.getItem("user");
  const dispatch = useDispatch();

  // ADD THIS STATE FOR THE KEY
  const [formInstanceKey, setFormInstanceKey] = useState(Date.now());

  const resetForm = useCallback(() => {
    setFormData({
      ...initialFormData,
      customerType: getInitialCustomerType(),
      date: new Date().toISOString().split("T")[0],
    });
    // UPDATE THE KEY TO FORCE RE-MOUNT OF CHECKBOXES
    setFormInstanceKey(Date.now());
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }, []);

  // This function is called by FloatLabel, CustomDatePicker, and indirectly by Checkbox
  const handleCustomComponentChange = useCallback((name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  useEffect(() => {
    if (formData.customerType === "buy") {
      setFormData(prev => ({ ...prev, upBudget: "", rentBudget: "" }));
    } else if (formData.customerType === "rent") {
      setFormData(prev => ({ ...prev, budget: "" }));
    }
  }, [formData.customerType]);

  useEffect(() => {
    let updates = {};
    let changed = false;
    if (formData.propertyType === "L") {
        updates = { ...updates, year: "", bedroom: "", units: "", elevator: false };
        changed = true;
    } else if (formData.propertyType === "S") {
        updates = { ...updates, bedroom: "", units: "" };
        changed = true;
    }
    if (changed) {
        setFormData(prev => ({ ...prev, ...updates }));
    }
  }, [formData.propertyType]);


  const handleSubmit = useCallback(async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    if (!formData.customerPhone || formData.customerPhone.length !== 11) {
      alert("شماره تلفن مشتری الزامی و باید ۱۱ رقم باشد.");
      setIsSubmitting(false); return;
    }
    if (!formData.customerName) {
      alert("نام مشتری الزامی است.");
      setIsSubmitting(false); return;
    }
    if (formData.customerType === "buy" && !formData.budget) {
      alert("بودجه برای مشتری خرید الزامی است.");
      setIsSubmitting(false); return;
    }
    if (formData.customerType === "rent" && (!formData.upBudget || !formData.rentBudget)) {
      alert("ودیعه و اجاره برای مشتری رهن/اجاره الزامی است.");
      setIsSubmitting(false); return;
    }

    let customerEntryData = {
      username: user, customer_type: formData.customerType, property_type: formData.propertyType,
      date: formData.date, updated: formData.date,
      m2: formData.m2 ? Number(formData.m2) : null,
      year: formData.year ? Number(formData.year) : null,
      bedroom: formData.bedroom ? Number(formData.bedroom) : null,
      budget: formData.budget ? Number(formData.budget) : null,
      up_budget: formData.upBudget ? Number(formData.upBudget) : null,
      rent_budget: formData.rentBudget ? Number(formData.rentBudget) : null,
      vahedha: formData.units ? Number(formData.units) : null,
      parking: Boolean(formData.parking),
      elevator: Boolean(formData.elevator),
      storage: Boolean(formData.storage),
      parking_motor: Boolean(formData.motorSpot),
      customer_name: formData.customerName, customer_phone: formData.customerPhone,
      description: formData.description || null,
    };

    if (formData.customerType === "buy") {
      delete customerEntryData.up_budget; delete customerEntryData.rent_budget;
    } else if (formData.customerType === "rent") {
      delete customerEntryData.budget;
    }

    if (formData.propertyType === "L") {
        delete customerEntryData.year; delete customerEntryData.bedroom; delete customerEntryData.vahedha; delete customerEntryData.elevator;
    } else if (formData.propertyType === "S") {
        delete customerEntryData.bedroom; delete customerEntryData.vahedha;
    }

    try {
      const response = await api.post(`customer/${customerEntryData.customer_type}/new/`, customerEntryData);
      if (response.status === 201) {
        dispatch(setFlashMessage({ type: "SUCCESS", message: `مشتری با کد ${response.data["id"]} با موفقیت اضافه شد.` }));
        resetForm();
      } else {
        dispatch(setFlashMessage({ type: "WARNING", message: `مشتری ثبت شد اما با وضعیت: ${response.status}` }));
        resetForm();
      }
    } catch (error) {
      const errorMessage = error.response?.data?.detail || (error.response?.data && typeof error.response.data === 'object' ? JSON.stringify(error.response.data) : null) || error.message || 'خطا در ثبت مشتری. لطفا دوباره تلاش کنید.';
      dispatch(setFlashMessage({ type: "ERROR", message: errorMessage }));
    } finally {
      setIsSubmitting(false);
    }
  }, [user, formData, dispatch, resetForm]);

  const renderSelect = (name, value, onChange, options, labelText) => (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{labelText}</label>
      <select name={name} id={name} value={value} onChange={onChange} className={selectBaseClasses}>
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto p-6 sm:p-8 bg-white shadow-xl rounded-2xl my-8 ">
      <h1 className="text-3xl font-bold text-gray-800 mb-10 text-center">ثبت مشتری جدید</h1>
      <form onSubmit={handleSubmit} className="space-y-10">

        <fieldset className="p-6 border border-gray-300 rounded-lg">
          <legend className="text-lg font-medium text-indigo-600 px-2">اطلاعات پایه مشتری</legend>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-8 items-end">
            {renderSelect("customerType", formData.customerType, handleChange, CUSTOMER_TYPES, "نوع درخواست مشتری")}
            {renderSelect("propertyType", formData.propertyType, handleChange, PROPERTY_TYPES, "نوع ملک مورد نظر")}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">تاریخ ثبت</label>
              <CustomDatePicker date={formData.date} setter={(d) => handleCustomComponentChange('date', d)} inputClassName={selectBaseClasses} />
            </div>
          </div>
        </fieldset>

        <fieldset className="p-6 border border-gray-300 rounded-lg">
          <legend className="text-lg font-medium text-indigo-600 px-2">مشخصات ملک مورد نظر</legend>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-8">
            {formData.customerType === "buy" ? (
              <FloatLabel type="number" name="budget" label="بودجه کل (تومان)" value={formData.budget} setter={(val) => handleCustomComponentChange('budget', val)} isRequired />
            ) : (
              <>
                <FloatLabel type="number" name="upBudget" label="ودیعه مدنظر (تومان)" value={formData.upBudget} setter={(val) => handleCustomComponentChange('upBudget', val)} isRequired />
                <FloatLabel type="number" name="rentBudget" label="اجاره مدنظر (تومان)" value={formData.rentBudget} setter={(val) => handleCustomComponentChange('rentBudget', val)} isRequired />
              </>
            )}
            <FloatLabel type="number" name="m2" label="متراژ (حداقل متر مربع)" value={formData.m2} setter={(val) => handleCustomComponentChange('m2', val)} />

            {formData.propertyType !== "L" && (
              <FloatLabel type="number" name="year" label="سال ساخت (حداکثر)" value={formData.year} setter={(val) => handleCustomComponentChange('year', val)} />
            )}
            {(formData.propertyType === "A" || formData.propertyType === "H") && (
              <FloatLabel type="number" name="bedroom" label="تعداد اتاق خواب (حداقل)" value={formData.bedroom} setter={(val) => handleCustomComponentChange('bedroom', val)} />
            )}
            {formData.propertyType === "A" && (
              <FloatLabel type="number" name="units" label="واحد در طبقه (حداکثر)" value={formData.units} setter={(val) => handleCustomComponentChange('units', val)} />
            )}
          </div>
        </fieldset>

        <fieldset className="p-6 border border-gray-300 rounded-lg">
          <legend className="text-lg font-medium text-indigo-600 px-2">اطلاعات تماس مشتری</legend>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
            <FloatLabel type="tel" name="customerPhone" label="شماره تماس مشتری" value={formData.customerPhone} setter={(val) => handleCustomComponentChange('customerPhone', val)} isRequired maxChars={11} inputMode="numeric" pattern="[0-9]*" />
            <FloatLabel type="text" name="customerName" label="نام مشتری" value={formData.customerName} setter={(val) => handleCustomComponentChange('customerName', val)} isRequired />
          </div>
        </fieldset>

        <fieldset className="p-6 border border-gray-300 rounded-lg">
            <legend className="text-lg font-medium text-indigo-600 px-2">ترجیحات و توضیحات</legend>
            <div className="mt-4 space-y-8">
                {formData.propertyType !== "L" && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">امکانات مورد نظر</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-3">
                            <Checkbox
                              key={`parking-${formInstanceKey}`}
                              label="پارکینگ"
                              name="parking"
                              isChecked={formData.parking}
                              setter={(updaterFn) => handleCustomComponentChange('parking', updaterFn(formData.parking))}
                            />
                            <Checkbox
                              key={`elevator-${formInstanceKey}`}
                              label="آسانسور"
                              name="elevator"
                              isChecked={formData.elevator}
                              setter={(updaterFn) => handleCustomComponentChange('elevator', updaterFn(formData.elevator))}
                            />
                            <Checkbox
                              key={`storage-${formInstanceKey}`}
                              label="انباری"
                              name="storage"
                              isChecked={formData.storage}
                              setter={(updaterFn) => handleCustomComponentChange('storage', updaterFn(formData.storage))}
                            />
                            <Checkbox
                              key={`motorSpot-${formInstanceKey}`}
                              label="پارکینگ موتور"
                              name="motorSpot"
                              isChecked={formData.motorSpot}
                              setter={(updaterFn) => handleCustomComponentChange('motorSpot', updaterFn(formData.motorSpot))}
                            />
                        </div>
                    </div>
                )}
                <div>
                    <FloatLabel type="textarea" name="description" label="توضیحات و سایر ترجیحات مشتری (اختیاری)" value={formData.description} setter={(val) => handleCustomComponentChange('description', val)} />
                </div>
            </div>
        </fieldset>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75 text-lg disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              در حال ثبت...
            </div>
          ) : "ثبت مشتری"}
        </button>
      </form>
    </div>
  );
};

export default NewCustomer;
