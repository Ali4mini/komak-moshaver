// File: File.jsx (Property Card) - LARGER VERSION with Safeguard
import { Link } from "react-router-dom";
import elevatorIcon from "../assets/elevator.png";
import storageIcon from "../assets/storage.png";
import parkingIcon from "../assets/car.png";

// Helper for formatting numbers (optional, but good for UX)
const formatNumber = (num) => {
  if (num === null || num === undefined || isNaN(Number(num))) return "-";
  return Number(num).toLocaleString('fa-IR');
};

// Helper component for property details
const DetailItem = ({ label, value }) => (
  <div className="flex flex-col items-center text-center sm:items-start sm:text-right">
    <span className="text-sm text-gray-500 mb-0.5">{label}</span>
    <span className="text-base font-medium text-gray-800">{formatNumber(value)}</span>
  </div>
);

// Helper component for amenities
const AmenityIcon = ({ src, alt, present }) => {
  if (!present) return null;
  return (
    <div className="p-2 bg-gray-100 rounded-full">
      <img src={src} alt={alt} className="w-6 h-6 sm:w-7 sm:h-7 opacity-75" />
    </div>
  );
};

const File = ({ file }) => {
  // --- SAFEGUARD START ---
  if (!file || !file.id) { // Check for file and a key property like id
    // Optionally log this to help debug where the undefined file is coming from
    console.warn("File component received undefined or invalid file prop:", file);
    // Render null or a placeholder if the file data is missing
    // For a list, rendering null is often fine as it just won't show that item.
    return null;
    // Or you could return a placeholder:
    // return <div className="p-5 border border-red-300 rounded-xl m-1 text-red-700">Invalid file data</div>;
  }
  // --- SAFEGUARD END ---

  // The error occurs at this line if 'file' is undefined
  const updatedDate = new Date(file.updated);
  const currentDate = new Date();
  const diffTime = Math.abs(currentDate - updatedDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  let cardBgClass = "bg-white";
  if (file.status === "SOLD" || file.status === "RENTED") {
    cardBgClass = "bg-gray-200 opacity-75";
  } else if (diffDays > 30 && file.status === "ACTIVE") {
    cardBgClass = "bg-yellow-50 border-yellow-300";
  }

  return (
    <Link
      to={`/file/${file.file_type}/${file.id}`}
      className="block no-underline focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 rounded-xl group"
    >
      <article
        className={`${cardBgClass} border border-gray-200 shadow-lg group-hover:shadow-2xl transition-all duration-300 rounded-xl overflow-hidden m-1`}
      >
        <div className="p-5 sm:p-6">
          <div className="flex items-start sm:items-center justify-between mb-4 pb-4 border-b border-gray-200">
            <h2 className="text-lg sm:text-xl font-semibold text-indigo-700 प्रमुख leading-tight mr-3" title={file.address}>
              <span className="line-clamp-2 sm:line-clamp-none">{file.address}</span>
            </h2>
            <span className="flex-shrink-0 px-3.5 py-1.5 text-sm font-semibold text-indigo-800 bg-indigo-100 rounded-full whitespace-nowrap">
              کد: {file.id}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-5 gap-y-5 mb-5">
            {file.file_type === "sell" ? (
              <DetailItem label="قیمت کل (تومان)" value={file.price} />
            ) : (
              <>
                <DetailItem label="ودیعه (تومان)" value={file.price_up} />
                <DetailItem label="اجاره (تومان)" value={file.price_rent} />
              </>
            )}
            <DetailItem label="متراژ (متر مربع)" value={file.m2} />
            {file.property_type !== "L" && <DetailItem label="سال ساخت" value={file.year} />}
            {(file.property_type === "A") && <DetailItem label="طبقه" value={file.floor} />}
            {(file.property_type === "A" || file.property_type === "H") && <DetailItem label="اتاق خواب" value={file.bedroom} /> }
            {(file.property_type === "A") && <DetailItem label="واحد در طبقه" value={file.vahedha} />}
          </div>

          {(file.elevator || file.parking || file.storage) && file.property_type !== "L" && (
            <div className="flex items-center justify-start space-x-4 rtl:space-x-reverse pt-4 border-t border-gray-200 mt-4">
              <AmenityIcon src={elevatorIcon} alt="آسانسور" present={file.elevator} />
              <AmenityIcon src={parkingIcon} alt="پارکینگ" present={file.parking} />
              <AmenityIcon src={storageIcon} alt="انباری" present={file.storage} />
            </div>
          )}
        </div>
        {diffDays > 0 && file.status === "ACTIVE" && (
             <div className={`p-2.5 text-sm text-center ${diffDays > 30 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-50 text-gray-600'}`}>
                آخرین بروزرسانی: {diffDays} روز پیش
            </div>
        )}
         {(file.status === "SOLD" || file.status === "RENTED") && (
             <div className="p-2.5 text-sm text-center bg-gray-300 text-gray-700 font-medium">
                {file.status === "SOLD" ? "فروخته شده" : "اجاره رفته"}
            </div>
        )}
      </article>
    </Link>
  );
};

export default File;
