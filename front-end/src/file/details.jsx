import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api, media } from "../common/api";
import DeleteConfirm from "../common/delete_confim";
import MatchedCustomers from "../common/matched_customers";
import ImageSlider from "../common/imageSlider";
import NewCallLog from "../log_app/callLog";
import NewTourLog from "../log_app/tourLog";
import AddressSMS from "../common/sendAddressSMS";
// import MenuButton from "../common/dropdown_button"; // REMOVE THIS
import ActionToolbar from "../common/ActionToolbar";   // ADD THIS
import SimpleTooltip from "../common/SimpleTooltip"; // ADD THIS for Edit button

import {
  BuildingOffice2Icon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  PencilSquareIcon,
  PhoneIcon,
  ChatBubbleLeftEllipsisIcon,
  UserCircleIcon,
  UsersIcon,
  TrashIcon,
  ArrowPathIcon,
  EyeIcon,
  TagIcon,
  InformationCircleIcon,
  HomeIcon,
  // ListBulletIcon, // No longer needed for MenuButton icon
  PhotoIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  // NoSymbolIcon, // Not used in the latest snippet
} from "@heroicons/react/24/outline";

// Feature Icons
import carIcon from "../assets/car.png";
import elevatorIcon from "../assets/elevator.png";
import storageIcon from "../assets/storage.png";
import motorIcon from "../assets/storage.png";

const FileDetails = () => {
  const navigate = useNavigate();
  const { fileType, id } = useParams();
  const [file, setFile] = useState(null);
  const [person, setPerson] = useState(null);
  const [location, setLocation] = useState(null);
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isDeleteConfirm, setIsDeleteConfirm] = useState(false);
  const [isMatchedCustomer, setIsMatchedCustomer] = useState(false);
  const [isCallLog, setIsCallLog] = useState(false);
  const [isTourLog, setIsTourLog] = useState(false);
  const [isAddressSMS, setIsAddressSMS] = useState(false);
  const [isFileOld, setIsFileOld] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    setFile(null);
    setPerson(null);
    setLocation(null);
    setImages([]);

    const fetchFileDetails = async () => {
      try {
        const fileResponse = await api.get(`file/${fileType}/${id}/`);
        setFile(fileResponse.data);

        const today = new Date().getTime();
        const fileDate = fileResponse.data.date ? new Date(fileResponse.data.date).getTime() : null;
        if (fileDate) {
            const differenceInDays = (today - fileDate) / (1000 * 3600 * 24);
            setIsFileOld(differenceInDays >= 30);
        } else {
            setIsFileOld(false);
        }

        const ownerPromise = fileResponse.data.owner
          ? api.get(`common/persons/${fileResponse.data.owner}`).then(res => res).catch(err => {
              console.warn(`Failed to fetch owner ${fileResponse.data.owner}:`, err.response?.status, err.message);
              return { data: null, status: err.response?.status || 'error' };
            })
          : Promise.resolve({ data: null, status: 'not_requested' });

        const locationPromise = api.get(`file/${fileType}/${id}/location/`).then(res => res).catch(err => {
            if (err.response && err.response.status === 404) return { data: null, status: 404 };
            console.error("Error fetching location (non-404):", err.response?.status, err.message);
            return { data: null, status: err.response?.status || 'error' };
          });

        const imagesPromise = api.get(`file/${fileType}/${id}/images/`).then(res => res).catch(err => {
            if (err.response && err.response.status === 404) return { data: [], status: 404 };
            console.error("Error fetching images (non-404):", err.response?.status, err.message);
            return { data: [], status: err.response?.status || 'error' };
          });

        const [ownerRes, locationRes, imagesRes] = await Promise.all([
          ownerPromise,
          locationPromise,
          imagesPromise,
        ]);

        if (ownerRes?.status === 200) setPerson(ownerRes.data);
        if (locationRes?.status === 200) setLocation(locationRes.data); else setLocation(null);
        if (imagesRes?.status === 200) setImages(imagesRes.data); else setImages([]);

      } catch (err) {
        console.error("Critical error fetching file details:", err.response?.status, err.message);
        if (err.response && err.response.status === 404) {
            setError(`فایل با شناسه ${id} یافت نشد. ممکن است حذف شده باشد یا شناسه نامعتبر باشد.`);
        } else {
            setError("مشکلی در بارگذاری اطلاعات اصلی فایل پیش آمده است. لطفا صفحه را رفرش کنید یا بعدا تلاش نمایید.");
        }
        setFile(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (id && fileType) {
        fetchFileDetails();
    } else {
        setError("شناسه فایل یا نوع فایل نامعتبر است.");
        setIsLoading(false);
    }
  }, [fileType, id]);

  const features = [
    { name: "parking", icon: carIcon, text: "پارکینگ", key: "parking" },
    { name: "elevator", icon: elevatorIcon, text: "آسانسور", key: "elevator" },
    { name: "storage", icon: storageIcon, text: "انباری", key: "storage" },
    { name: "parking_motor", icon: motorIcon, text: "پارکینگ موتور", key: "parking_motor" },
    { name: "komod_divari", icon: carIcon, text: "کمددیواری", key: "komod_divari" },
  ];

  // Define icons without classes here, ActionToolbar will size them
  const optionItems = [
    { key: "callLog", label: "لاگ تماس", handler: () => setIsCallLog(true), icon: <PhoneIcon /> },
    { key: "addressSMS", label: "ارسال آدرس (SMS)", handler: () => setIsAddressSMS(true), icon: <ChatBubbleLeftEllipsisIcon /> },
    { key: "tourLog", label: "لاگ بازدید", handler: () => setIsTourLog(true), icon: <HomeIcon /> },
    {
      key: "updated", label: "احیا فایل", disabled: !isFileOld,
      handler: () => {
        api.patch(`file/${fileType}/${id}/`, { updated: new Date().toISOString(), status: "ACTIVE" })
          .then(() => {
              setIsFileOld(false);
              if (file) setFile({...file, persian_updated: "هم اکنون", status: "ACTIVE", status_display: "فعال"});
          })
          .catch((error) => {
            console.error("Error updating file:", error.response?.data || error.message);
          });
      }, icon: <ArrowPathIcon />,
    },
    { key: "matched_customers", label: "مشتریان مرتبط", handler: () => setIsMatchedCustomer(true), icon: <UsersIcon /> },
    { 
      key: "delete", 
      label: "حذف فایل", 
      // Provide hover styles directly for specific items if needed
      style: "text-red-600 hover:text-red-700 hover:bg-red-100", 
      handler: () => setIsDeleteConfirm(true), 
      icon: <TrashIcon /> 
    },
  ];

  const InfoItem = ({ label, value, icon, className = "", valueClassName = "", onClick }) => (
    <div className={`flex items-start ${className}`}>
      {icon && (
        <div className="me-2 text-gray-500 flex-shrink-0 relative top-[3px]"> {/* me-2 for RTL */}
          {icon}
        </div>
      )}
      <p className="text-sm text-gray-600">{label}:</p>
      <p 
        className={`ms-1.5 text-sm font-medium text-gray-800 break-words ${valueClassName}`} // ms-1.5 for RTL
        onClick={onClick}
      >
        {value !== null && value !== undefined && value !== '' ? value : "---"}
      </p>
    </div>
  );

  const SectionCard = ({ title, children, icon, titleClassName="" }) => (
    <div className="bg-white shadow-xl rounded-xl p-5 md:p-6 mb-6">
      {title && (
        <div className="flex items-center mb-4 border-b border-gray-200 pb-3">
          {icon && <div className="me-3 text-blue-600">{icon}</div>} {/* me-3 for RTL */}
          <h2 className={`text-xl font-semibold text-gray-700 ${titleClassName}`}>{title}</h2>
        </div>
      )}
      {children}
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
        <p className="mt-4 text-lg text-gray-700">در حال بارگذاری اطلاعات فایل...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-6 text-center bg-gray-100">
        <ExclamationTriangleIcon className="w-20 h-20 text-red-500 mb-6" />
        <h2 className="text-2xl font-semibold text-red-700 mb-3">خطا در بارگذاری</h2>
        <p className="text-gray-600 mb-8 max-w-md">{error}</p>
        <button onClick={() => navigate("/")} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-150">
          بازگشت به لیست فایل‌ها
        </button>
      </div>
    );
  }
  
  if (!file) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-6 text-center bg-gray-100">
        <InformationCircleIcon className="w-20 h-20 text-orange-500 mb-6" />
        <h2 className="text-2xl font-semibold text-orange-700 mb-3">فایل یافت نشد</h2>
        <p className="text-gray-600 mb-8">اطلاعات این فایل در دسترس نیست یا ممکن است شناسه نامعتبر باشد.</p>
        <button onClick={() => navigate("/")} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-150">
          بازگشت به لیست فایل‌ها
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6 lg:p-8">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-x-4 gap-y-3">
        <div className="flex-grow min-w-0">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 truncate">
            جزئیات فایل <span className="text-gray-500 font-normal">(کد: {id})</span>
          </h1>
          <p className="text-sm text-gray-500">
            {fileType === "sell" ? "فایل فروش" : "فایل اجاره"}
          </p>
        </div>

        {/* Action buttons area */}
        <div className="flex flex-col items-stretch sm:items-end sm:flex-row sm:items-center gap-2 shrink-0 w-full sm:w-auto">
          {isFileOld && (
            <span className="text-center sm:text-right px-3 py-1.5 text-xs font-semibold text-yellow-800 bg-yellow-100 border border-yellow-300 rounded-md flex items-center justify-center sm:justify-start order-first sm:order-none"> {/* Adjusted order for flex */}
              <ExclamationTriangleIcon className="w-4 h-4 me-1.5 flex-shrink-0"/>
              فایل قدیمی (نیاز به احیا)
            </span>
          )}
          {/* Group Edit button and ActionToolbar */}
          <div className="flex items-center gap-1 bg-white shadow-sm rounded-lg border border-slate-200 p-0.5 w-full sm:w-auto">
            <SimpleTooltip text="ویرایش فایل" position="top">
              <button
                onClick={() => navigate("edit/")}
                className="flex items-center justify-center p-2 rounded-md text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors duration-150 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 focus-visible:ring-offset-white"
                aria-label="ویرایش فایل"
              >
                <PencilSquareIcon className="w-5 h-5" />
                <span className="hidden md:inline ms-1.5 text-sm font-medium">ویرایش</span> {/* ms-1.5 for RTL */}
              </button>
            </SimpleTooltip>
            
            {optionItems.length > 0 && (
              <div className="h-5 w-px bg-slate-300 self-center"></div>
            )}

            <ActionToolbar items={optionItems} />
          </div>
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: File Details, Owner, Property Specs, etc. */}
        <div className="lg:col-span-2 space-y-6">
          <SectionCard title="اطلاعات اصلی فایل" icon={<InformationCircleIcon className="w-7 h-7"/>}>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-3.5">
              <InfoItem label="نوع فایل" value={fileType === "sell" ? "فروش" : "اجاره"} icon={<TagIcon className="w-5 h-5"/>}/>
              <InfoItem label="نوع ملک" value={file.property_type_display || file.property_type} icon={<BuildingOffice2Icon className="w-5 h-5"/>}/>
              <InfoItem label="تاریخ ثبت" value={file.file_date} icon={<CalendarDaysIcon className="w-5 h-5"/>}/>
              <InfoItem label="ثبت شده توسط" value={file.added_by} icon={<UserCircleIcon className="w-5 h-5"/>}/>
              <InfoItem 
                label="وضعیت" 
                value={file.status_display || file.status || "نامشخص"} 
                icon={<TagIcon className="w-5 h-5"/>} 
                valueClassName={`font-semibold ${
                  file.status === "ACTIVE" ? "text-green-600" : 
                  (file.status === "SOLD" || file.status === "RENTED" ? "text-blue-600" : 
                  (file.status === "ARCHIVED" || file.status === "DELETED" ? "text-gray-500" : "text-red-600"))
                }`}
              />
              <InfoItem label="آخرین بروزرسانی" value={file.persian_updated || "نامشخص"} icon={<ArrowPathIcon className="w-5 h-5"/>} className="md:col-span-1"/>
            </div>
          </SectionCard>

          {person && (
             <SectionCard title="اطلاعات مالک" icon={<UserCircleIcon className="w-7 h-7"/>}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3.5">
                <InfoItem
                  label="نام مالک"
                  value={`${person.first_name || ""} ${person.last_name || ""}`.trim() || "نامشخص"}
                  icon={<UserCircleIcon className="w-5 h-5"/>}
                  valueClassName="cursor-pointer text-blue-600 hover:underline"
                  onClick={() => person.id && navigate(`/persons/${person.id}`)}
                />
                <InfoItem
                  label="شماره مالک"
                  value={person.phone_number}
                  icon={<PhoneIcon className="w-5 h-5"/>}
                  valueClassName="cursor-pointer text-blue-600 hover:underline"
                  onClick={() => person.phone_number && (window.location.href = `tel:${person.phone_number}`)}
                />
              </div>
            </SectionCard>
          )}

          <SectionCard title="مشخصات ملک" icon={<HomeIcon className="w-7 h-7"/>}>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-3.5">
              <InfoItem label="متراژ (مترمربع)" value={file.m2} />
              {fileType === "sell" ? (
                <InfoItem label="قیمت کل (تومان)" value={file.price ? Number(file.price).toLocaleString() : null} icon={<CurrencyDollarIcon className="w-5 h-5"/>}/>
              ) : (
                <>
                  <InfoItem label="ودیعه (تومان)" value={file.price_up ? Number(file.price_up).toLocaleString() : null} icon={<CurrencyDollarIcon className="w-5 h-5"/>}/>
                  <InfoItem label="اجاره (تومان)" value={file.price_rent ? Number(file.price_rent).toLocaleString() : null} icon={<CurrencyDollarIcon className="w-5 h-5"/>}/>
                </>
              )}
              <InfoItem label="سال ساخت" value={file.year} />
              <InfoItem label="طبقه" value={file.floor} />
              <InfoItem label="تعداد کل طبقات" value={file.tabaghat} />
              <InfoItem label="تعداد خواب" value={file.bedroom} />
              <InfoItem label="واحد در طبقه" value={file.vahedha} />
              <InfoItem label="تبدیل" value={file.tabdil ? "دارد" : (file.tabdil === false ? "ندارد" : null)} />
              <InfoItem label="وضعیت بازدید" value={file.bazdid_display || file.bazdid || "هماهنگ شود"} icon={<EyeIcon className="w-5 h-5"/>}/>
            </div>
          </SectionCard>

          {(file.tenet_phone || file.lobbyMan_phone) && (
            <SectionCard title="اطلاعات تماس اضافی" icon={<PhoneIcon className="w-7 h-7"/>}>
              <div className="space-y-4">
                {file.tenet_phone && (
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="font-semibold text-gray-700 mb-1.5 text-sm">اطلاعات مستاجر:</p>
                    <InfoItem label="نام" value={file.tenet_name} />
                    <InfoItem label="شماره تماس" value={file.tenet_phone} icon={<PhoneIcon className="w-4 h-4"/>} />
                  </div>
                )}
                {file.lobbyMan_phone && (
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="font-semibold text-gray-700 mb-1.5 text-sm">اطلاعات سرایدار:</p>
                    <InfoItem label="نام" value={file.lobbyMan_name} />
                    <InfoItem label="شماره تماس" value={file.lobbyMan_phone} icon={<PhoneIcon className="w-4 h-4"/>}/>
                  </div>
                )}
              </div>
            </SectionCard>
          )}

          <SectionCard title="آدرس و توضیحات" icon={<MapPinIcon className="w-7 h-7"/>}>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-700 mb-1">آدرس:</h3>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap p-3 bg-gray-50 rounded-md border border-gray-200">{file.address || "آدرس ثبت نشده است."}</p>
              </div>
              <div>
                <h3 className="font-medium text-gray-700 mb-1">توضیحات:</h3>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap p-3 bg-gray-50 rounded-md border border-gray-200">{file.description || "توضیحاتی ثبت نشده است."}</p>
              </div>
            </div>
          </SectionCard>

          {features.filter(f => file?.[f.key]).length > 0 && (
             <SectionCard title="امکانات ملک" icon={<CheckCircleIcon className="w-7 h-7 text-green-500"/>}>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 text-center">
                {features.map(({ key, icon, text }) =>
                    file?.[key] && (
                    <div key={key} className="flex flex-col items-center justify-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-all">
                        <img src={icon} alt={text} className="w-8 h-8 mb-1.5" />
                        <span className="text-xs text-gray-700 font-medium">{text}</span>
                    </div>
                    )
                )}
                </div>
            </SectionCard>
          )}
        </div>

        {/* Column 2: Gallery, Location Map */}
        <div className="lg:col-span-1 space-y-6">
          <SectionCard title="گالری تصاویر" icon={<PhotoIcon className="w-7 h-7"/>}>
            {images && images.length > 0 ? (
              <ImageSlider images={images} />
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-500 py-10 border-2 border-dashed border-gray-300 rounded-lg">
                <PhotoIcon className="w-12 h-12 mb-3 text-gray-400" />
                <p className="text-sm">تصویری برای این ملک بارگذاری نشده.</p>
              </div>
            )}
          </SectionCard>

          <SectionCard title="موقعیت مکانی" icon={<MapPinIcon className="w-7 h-7"/>}>
            {location && location.image ? (
              <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden shadow-md border border-gray-200">
                <img 
                    src={location.image.startsWith('http') ? location.image : `${media}${location.image}`}
                    alt="موقعیت ملک روی نقشه" 
                    className="object-cover w-full h-full"
                    onError={(e) => { 
                        e.target.onerror = null; // Prevent infinite loop if fallback also fails
                        e.target.style.display = 'none';
                        const fallbackDiv = e.target.nextElementSibling;
                        if (fallbackDiv && fallbackDiv.classList.contains('map-fallback')) {
                            fallbackDiv.style.display = 'flex';
                        }
                    }}
                />
                <div className="map-fallback hidden flex-col items-center justify-center text-gray-500 py-10 border-2 border-dashed border-gray-300 rounded-lg aspect-w-16 aspect-h-9">
                    <MapPinIcon className="w-12 h-12 mb-3 text-gray-400" />
                    <p className="text-sm">خطا در بارگذاری تصویر نقشه.</p>
                </div>
              </div>
            ) : (
                 <div className="flex flex-col items-center justify-center text-gray-500 py-10 border-2 border-dashed border-gray-300 rounded-lg">
                    <MapPinIcon className="w-12 h-12 mb-3 text-gray-400" />
                    <p className="text-sm">موقعیت مکانی ثبت نشده است.</p>
                 </div>
            )}
          </SectionCard>
        </div>
      </div>

      {/* Modals */}
      {isMatchedCustomer && file && (
        <MatchedCustomers
          isOpen={isMatchedCustomer}
          setIsOpen={setIsMatchedCustomer}
          notifiedCustomers={file.notified_customers || []}
        />
      )}
      {isDeleteConfirm && file && (
        <DeleteConfirm
          isOpen={isDeleteConfirm}
          setIsOpen={setIsDeleteConfirm}
          title={"آیا از پاک کردن این فایل مطمئنید؟"}
          description={"این عملیات غیرقابل بازگشت است. اگر فایل را اشتباهی پاک کردید سریعا به مدیر مجموعه اطلاع رسانی کنید."}
          onConfirm={() => {
            api.delete(`file/${fileType}/${id}/`)
               .then(() => {
                 setIsDeleteConfirm(false);
                 navigate("/", {replace: true, state: { message: "فایل با موفقیت حذف شد." }});
               })
               .catch(err => {
                 console.error("Failed to delete file:", err.response?.data || err.message);
                 setIsDeleteConfirm(false); 
               });
          }}
        />
      )}
      {isCallLog && file && (
        <NewCallLog
          isOpen={isCallLog}
          setIsOpen={setIsCallLog}
          fileId={file.id}
          fileType={fileType}
        />
      )}
      {isAddressSMS && file && (
        <AddressSMS
          isOpen={isAddressSMS}
          setIsOpen={setIsAddressSMS}
          data={{ ...file, person }}
        />
      )}
      {isTourLog && file && (
        <NewTourLog
          isOpen={isTourLog}
          setIsOpen={setIsTourLog}
          fileId={file.id}
          fileType={fileType}
        />
      )}
    </div>
  );
};

export default FileDetails;
