import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../common/api";
import DeleteConfirm from "../common/delete_confim";
import MatchedFiles from "../common/matched_files";
// import MenuButton from "../common/dropdown_button"; // REMOVE THIS
import ActionToolbar from "../common/ActionToolbar";   // ADD THIS
import SimpleTooltip from "../common/SimpleTooltip"; // ADD THIS for Edit button tooltip

// Import Heroicons
import {
  UserCircleIcon,
  PhoneIcon,
  CalendarDaysIcon,
  PencilSquareIcon,
  TrashIcon,
  ArrowPathIcon, 
  UsersIcon,     
  // ListBulletIcon, // No longer needed for MenuButton icon
  TagIcon,
  BuildingOfficeIcon, 
  InformationCircleIcon, 
  CurrencyDollarIcon, 
  HomeIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  Bars3BottomLeftIcon, 
  UserPlusIcon, 
} from "@heroicons/react/24/outline";

// Feature Icons
import car from "../assets/car.png";
import elevator from "../assets/elevator.png";
import storage from "../assets/storage.png";
import motor from "../assets/storage.png";

// Reusable SectionCard component
const SectionCard = ({ title, children, icon, titleClassName = "" }) => (
  <div className="bg-white shadow-xl rounded-xl p-5 md:p-6 mb-6">
    {title && (
      <div className="flex items-center mb-4 border-b border-gray-200 pb-3">
        {icon && <div className="me-3 text-indigo-600">{icon}</div>}
        <h2 className={`text-xl font-semibold text-gray-700 ${titleClassName}`}>
          {title}
        </h2>
      </div>
    )}
    {children}
  </div>
);

// Reusable InfoItem component
const InfoItem = ({ label, value, icon, className = "", valueClassName = "", onClick }) => (
    <div className={`flex items-start ${className}`}>
      {icon && (
        <div className="me-2 text-gray-500 flex-shrink-0 relative top-[3px]">
          {icon}
        </div>
      )}
      <p className="text-sm text-gray-600">{label}:</p>
      <p 
        className={`ms-1.5 text-sm font-medium text-gray-800 break-words ${valueClassName} ${onClick ? 'cursor-pointer hover:underline' : ''}`}
        onClick={onClick}
      >
        {value !== null && value !== undefined && value !== '' ? value : "---"}
      </p>
    </div>
  );


const CustomerDetail = () => {
  const navigate = useNavigate();
  const { customerType, id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [person, setPerson] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isDeleteConfirm, setIsDeleteConfirm] = useState(false);
  const [isMatchedFile, setIsMatchedFile] = useState(false);
  const [isCustomerOld, setIsCustomerOld] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    setCustomer(null);
    setPerson(null);

    const fetchCustomerDetails = async () => {
      try {
        const customerResponse = await api.get(`customer/${customerType}/${id}/`);
        const customerData = customerResponse.data;
        setCustomer(customerData);

        const today = new Date().getTime();
        const updatedDate = customerData.updated ? new Date(customerData.updated).getTime() : null;
        if (updatedDate) {
          const differenceInDays = (today - updatedDate) / (1000 * 3600 * 24);
          setIsCustomerOld(differenceInDays >= 30);
        } else {
          setIsCustomerOld(true); // Assume old if no updated
        }

        if (customerData.customer) {
          try {
            const personResponse = await api.get(`common/persons/${customerData.customer}`);
            setPerson(personResponse.data);
          } catch (personErr) {
            console.warn(`Failed to fetch person ${customerData.customer}:`, personErr.response?.status, personErr.message);
            setPerson(null);
          }
        }
      } catch (err) {
        console.error("Error fetching customer details:", err.response?.status, err.message);
        if (err.response && err.response.status === 404) {
            setError(`مشتری با شناسه ${id} یافت نشد.`);
        } else {
            setError("مشکلی در بارگذاری اطلاعات مشتری پیش آمده است.");
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    if (id && customerType) {
        fetchCustomerDetails();
    } else {
        setError("شناسه یا نوع مشتری نامعتبر است.");
        setIsLoading(false);
    }

  }, [id, customerType]);

  const features = [
    { key: 'parking', image: car, text: 'پارکینگ' },
    { key: 'elevator', image: elevator, text: 'آسانسور' },
    { key: 'storage', image: storage, text: 'انباری' },
    { key: 'parking_motor', image: motor, text: 'پارکینگ موتور' },
    { key: 'komod_divari', image: car, text: 'کمددیواری' },
  ];

  // For ActionToolbar, icons should be just the component, sizing is handled by ActionToolbar
  const optionItems = [
    {
      key: "updated",
      label: "مشتری موجود است (احیا)",
      disabled: !isCustomerOld, 
      handler: () => {
        api.patch(`customer/${customerType}/${id}/`, { updated: new Date().toISOString() })
          .then(() => {
            setIsCustomerOld(false); 
            if(customer) setCustomer({...customer, persian_updated: "هم اکنون", updated: new Date().toISOString() });
          })
          .catch((error) => {
            console.error("Error updating customer:", error.response?.data || error.message);
          });
      },
      icon: <ArrowPathIcon />, // Pass the icon component directly
    },
    {
      key: "matched_files",
      label: "فایل های مرتبط",
      handler: () => setIsMatchedFile(true),
      icon: <UsersIcon />,
    },
    {
      key: "delete",
      label: "حذف مشتری",
      style: "text-red-600 hover:text-red-700 hover:bg-red-100", // Style for the button itself
      handler: () => setIsDeleteConfirm(true),
      icon: <TrashIcon />,
    },
  ];


  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500"></div>
        <p className="mt-4 text-lg text-gray-700">در حال بارگذاری اطلاعات مشتری...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-6 text-center bg-gray-100">
        <ExclamationTriangleIcon className="w-20 h-20 text-red-500 mb-6" />
        <h2 className="text-2xl font-semibold text-red-700 mb-3">خطا در بارگذاری</h2>
        <p className="text-gray-600 mb-8 max-w-md">{error}</p>
        <button onClick={() => navigate("/customers")}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-150">
          بازگشت به لیست مشتریان
        </button>
      </div>
    );
  }
  
  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-6 text-center bg-gray-100">
        <InformationCircleIcon className="w-20 h-20 text-orange-500 mb-6" />
        <h2 className="text-2xl font-semibold text-orange-700 mb-3">مشتری یافت نشد</h2>
        <p className="text-gray-600 mb-8">اطلاعات این مشتری در دسترس نیست.</p>
        <button onClick={() => navigate("/customers")} 
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-150">
           بازگشت به لیست مشتریان
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6 lg:p-8">
      {/* Header Section */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-x-4 gap-y-3">
        <div className="flex-grow min-w-0">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 truncate">
            جزئیات مشتری <span className="text-gray-500 font-normal">(کد: {id})</span>
          </h1>
          <p className="text-sm text-gray-500">
            مشتری {customerType === "buy" ? "خرید" : "اجاره"}
          </p>
        </div>

        {/* Action buttons area - MODIFIED */}
        <div className="flex flex-col items-stretch sm:items-end sm:flex-row sm:items-center gap-2 shrink-0 w-full sm:w-auto">
          {isCustomerOld && (
            <span className="text-center sm:text-right px-3 py-1.5 text-xs font-semibold text-yellow-800 bg-yellow-100 border border-yellow-300 rounded-md flex items-center justify-center sm:justify-start order-first sm:order-none">
              <ExclamationTriangleIcon className="w-4 h-4 me-1.5 flex-shrink-0"/>
              مشتری قدیمی (نیاز به استعلام مجدد)
            </span>
          )}
          {/* Group Edit button and ActionToolbar */}
          <div className="flex items-center gap-1 bg-white shadow-sm rounded-lg border border-slate-200 p-0.5 w-full sm:w-auto">
            <SimpleTooltip text="ویرایش مشتری" position="top">
              <button
                onClick={() => navigate("edit/")}
                className="flex items-center justify-center p-2 rounded-md text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors duration-150 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 focus-visible:ring-offset-white"
                aria-label="ویرایش مشتری"
              >
                <PencilSquareIcon className="w-5 h-5" />
                <span className="hidden md:inline ms-1.5 text-sm font-medium">ویرایش</span> {/* ms-1.5 for RTL */}
              </button>
            </SimpleTooltip>
            
            {optionItems.length > 0 && (
              <div className="h-5 w-px bg-slate-300 self-center mx-0.5"></div> 
            )}

            <ActionToolbar items={optionItems} />
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {person && (
            <SectionCard title="اطلاعات شخصی مشتری" icon={<UserCircleIcon className="w-7 h-7"/>}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3.5">
                <InfoItem
                  label="نام مشتری"
                  value={`${person.first_name || ""} ${person.last_name || ""}`.trim() || "نامشخص"}
                  icon={<UserCircleIcon className="w-5 h-5"/>}
                  valueClassName="text-indigo-600"
                  onClick={() => person.id && navigate(`/persons/${person.id}`)}
                />
                <InfoItem
                  label="شماره تماس"
                  value={person.phone_number}
                  icon={<PhoneIcon className="w-5 h-5"/>}
                  valueClassName="text-indigo-600"
                  onClick={() => person.phone_number && (window.location.href = `tel:${person.phone_number}`)}
                />
              </div>
            </SectionCard>
          )}

          <SectionCard title="جزئیات درخواست" icon={<InformationCircleIcon className="w-7 h-7"/>}>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-3.5">
                <InfoItem label="نوع درخواست" value={customerType === "buy" ? "خرید" : "اجاره"} icon={<TagIcon className="w-5 h-5"/>}/>
                <InfoItem label="نوع ملک درخواستی" value={customer.property_type_display || customer.property_type} icon={<BuildingOfficeIcon className="w-5 h-5"/>}/>
                <InfoItem label="تاریخ ثبت درخواست" value={customer.customer_date_jalali || customer.customer_date} icon={<CalendarDaysIcon className="w-5 h-5"/>}/>
                <InfoItem label="آخرین استعلام" value={customer.persian_updated || customer.updated} icon={<ArrowPathIcon className="w-5 h-5"/>}/>
                <InfoItem label="ثبت شده توسط" value={customer.added_by_display || customer.added_by} icon={<UserPlusIcon className="w-5 h-5"/>}/>
            </div>
          </SectionCard>

          <SectionCard title="مشخصات ملک مورد نظر" icon={<HomeIcon className="w-7 h-7"/>}>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-3.5">
                <InfoItem label="متراژ مورد نظر (مترمربع)" value={customer.m2} />
                {customerType === "buy" ? (
                    <InfoItem label="بودجه خرید (تومان)" value={customer.budget ? Number(customer.budget).toLocaleString() : null} icon={<CurrencyDollarIcon className="w-5 h-5"/>}/>
                ) : (
                    <>
                    <InfoItem label="ودیعه (تومان)" value={customer.up_budget ? Number(customer.up_budget).toLocaleString() : null} icon={<CurrencyDollarIcon className="w-5 h-5"/>}/>
                    <InfoItem label="اجاره (تومان)" value={customer.rent_budget ? Number(customer.rent_budget).toLocaleString() : null} icon={<CurrencyDollarIcon className="w-5 h-5"/>}/>
                    </>
                )}
                <InfoItem label="حداکثر سال ساخت" value={customer.year} />
                <InfoItem label="تعداد خواب" value={customer.bedroom} />
                <InfoItem label="تعداد واحد در طبقه" value={customer.vahedha} /> {/* Assuming 'vahedha' means units per floor */}
            </div>
          </SectionCard>
          
          {features.filter(f => customer?.[f.key]).length > 0 && (
             <SectionCard title="امکانات ضروری" icon={<CheckCircleIcon className="w-7 h-7 text-green-500"/>}>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 text-center">
                {features.map(({ key, image, text }) =>
                    customer?.[key] && (
                    <div key={key} className="flex flex-col items-center justify-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-all">
                        <img src={image} alt={text} className="w-8 h-8 mb-1.5" />
                        <span className="text-xs text-gray-700 font-medium">{text}</span>
                    </div>
                    )
                )}
                </div>
            </SectionCard>
          )}

          <SectionCard title="توضیحات مشتری" icon={<Bars3BottomLeftIcon className="w-7 h-7"/>}>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap p-3 bg-gray-50 rounded-md border border-gray-200">
                {customer.description || "توضیحاتی ثبت نشده است."}
            </p>
          </SectionCard>
        </div>

        <div className="lg:col-span-1 space-y-6">
            <SectionCard title="فعالیت‌های مرتبط">
                <div className="flex flex-col items-center justify-center text-gray-400 py-10 border-2 border-dashed border-gray-300 rounded-lg">
                    <InformationCircleIcon className="w-10 h-10 mb-2"/>
                    <p className="text-sm">بخشی برای لاگ‌ها یا فعالیت‌ها</p>
                </div>
            </SectionCard>
        </div>
      </div>

      {isMatchedFile && customer && (
        <MatchedFiles
          isOpen={isMatchedFile}
          setIsOpen={setIsMatchedFile}
          customerId={customer.id}
          customerType={customerType}
        />
      )}
      {isDeleteConfirm && customer && (
        <DeleteConfirm
          isOpen={isDeleteConfirm}
          setIsOpen={setIsDeleteConfirm}
          onConfirm={() => {
            api.delete(`customer/${customerType}/${id}/`)
               .then(() => {
                 setIsDeleteConfirm(false);
                 navigate("/customers", {replace: true, state: { message: "مشتری با موفقیت حذف شد." }}); 
               })
               .catch(err => {
                 console.error("Failed to delete customer:", err.response?.data || err.message);
                 setIsDeleteConfirm(false);
               });
          }}
          title={"آیا از پاک کردن این مشتری مطمئنید؟"}
          description={"این عملیات غیرقابل بازگشت است."}
        />
      )}
    </div>
  );
};

export default CustomerDetail;
