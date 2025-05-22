// File: customer_card.jsx
import { Link } from "react-router-dom";
import elevatorIcon from "../assets/elevator.png"; // Assuming same icons are relevant
import storageIcon from "../assets/storage.png";
import parkingIcon from "../assets/car.png";

// Helper for formatting numbers
const formatNumber = (num) => {
  if (num === null || num === undefined || isNaN(Number(num))) return "-";
  return Number(num).toLocaleString('fa-IR');
};

// Helper component for customer details
const DetailItem = ({ label, value }) => (
  <div className="flex flex-col items-center text-center sm:items-start sm:text-right">
    <span className="text-sm text-gray-500 mb-0.5">{label}</span>
    <span className="text-base font-medium text-gray-800">{formatNumber(value)}</span>
  </div>
);

// Helper component for amenities (if customer preferences include these)
const AmenityIcon = ({ src, alt, present }) => {
  if (!present) return null;
  return (
    <div className="p-2 bg-gray-100 rounded-full">
      <img src={src} alt={alt} className="w-6 h-6 sm:w-7 sm:h-7 opacity-75" />
    </div>
  );
};

// Renamed component to start with uppercase, standard practice
const CustomerCard = ({ customer }) => {
  // Safeguard for undefined customer prop
  if (!customer || !customer.id) {
    console.warn("CustomerCard received undefined or invalid customer prop:", customer);
    return null; // Or a placeholder
  }

  const updatedDate = new Date(customer.updated);
  const currentDate = new Date();
  const diffTime = Math.abs(currentDate - updatedDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let cardBgClass = "bg-white";
  // Example status handling, adapt if 'customer.status' is different from 'file.status'
  if (customer.status === "CLOSED" || customer.status === "SATISFIED") { // Assuming these are possible statuses
    cardBgClass = "bg-gray-200 opacity-75";
  } else if (diffDays > 30 && customer.status === "ACTIVE") { // Assuming ACTIVE status
    cardBgClass = "bg-yellow-50 border-yellow-300";
  }


  return (
    <Link
      to={`/customer/${customer.customer_type}/${customer.id}`}
      className="block no-underline focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50 rounded-xl group"
    >
      <article
        className={`${cardBgClass} border border-gray-200 shadow-lg group-hover:shadow-2xl transition-all duration-300 rounded-xl overflow-hidden m-1`}
      >
        <div className="p-5 sm:p-6">
          <div className="flex items-start sm:items-center justify-between mb-4 pb-4 border-b border-gray-200">
            <h2 className="text-lg sm:text-xl font-semibold text-teal-700 प्रमुख leading-tight mr-3" title={customer.customer_name}>
              <span className="line-clamp-2 sm:line-clamp-none">{customer.customer_name || "نامشخص"}</span>
            </h2>
            <span className="flex-shrink-0 px-3.5 py-1.5 text-sm font-semibold text-teal-800 bg-teal-100 rounded-full whitespace-nowrap">
              کد: {customer.id}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-5 gap-y-5 mb-5">
            {customer.customer_type === "buy" ? (
              <DetailItem label="بودجه مدنظر (تومان)" value={customer.budget} />
            ) : (
              <>
                <DetailItem label="ودیعه مدنظر (تومان)" value={customer.up_budget} />
                <DetailItem label="اجاره مدنظر (تومان)" value={customer.rent_budget} />
              </>
            )}
            <DetailItem label="متراژ مدنظر (متر مربع)" value={customer.m2} />
            {customer.property_type !== "L" && <DetailItem label="سال ساخت مدنظر" value={customer.year} />}
            {/* Customer preferences might not have floor/units, adjust if API provides this for customer preference */}
            {/* {(customer.property_type === "A") && <DetailItem label="طبقه" value={customer.floor} />} */}
            {(customer.property_type === "A" || customer.property_type === "H") && <DetailItem label="اتاق خواب مدنظر" value={customer.bedroom} /> }
            {/* {(customer.property_type === "A") && <DetailItem label="واحد در طبقه" value={customer.vahedha} />} */}
          </div>

          {(customer.elevator || customer.parking || customer.storage) && customer.property_type !== "L" && (
            <div className="flex items-center justify-start space-x-4 rtl:space-x-reverse pt-4 border-t border-gray-200 mt-4">
              <AmenityIcon src={elevatorIcon} alt="آسانسور" present={customer.elevator} />
              <AmenityIcon src={parkingIcon} alt="پارکینگ" present={customer.parking} />
              <AmenityIcon src={storageIcon} alt="انباری" present={customer.storage} />
            </div>
          )}
        </div>
        {/* Footer status/update info */}
        {diffDays > 0 && customer.status === "ACTIVE" && ( // Assuming ACTIVE status
             <div className={`p-2.5 text-sm text-center ${diffDays > 30 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-50 text-gray-600'}`}>
                آخرین بروزرسانی: {diffDays} روز پیش
            </div>
        )}
         {(customer.status === "CLOSED" || customer.status === "SATISFIED") && (
             <div className="p-2.5 text-sm text-center bg-gray-300 text-gray-700 font-medium">
                {customer.status === "CLOSED" ? "بسته شده" : "به نتیجه رسیده"}
            </div>
        )}
      </article>
    </Link>
  );
};

export default CustomerCard; // Renamed export
