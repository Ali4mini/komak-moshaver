import { Link } from "react-router-dom";
import SearchButtonWithModal from "../home/search.jsx"
import { useEffect, useState } from "react";
import { api } from "./api";
import LogOutConfirm from "./logout_confirm";

const NavBar = () => {
  const [scannerFilesCount, setScannerFilesCount] = useState(0)
  const [restoreFilesCount, setRestoreFilesCount] = useState(0)
  const [isLogOutConfirm, setIsLogOutConfirm] = useState(false);
  const [isSearch, setIsSearch] = useState(false);

  // count of divar bot added files
  useEffect(() => {
    api
      .get("listing/?count", { params: { owner_name: "UNKNOWN", status: "ACTIVE", "count": null } })
      .then((response) => {
        setScannerFilesCount(response.data["count"])
      })
      .catch((error) => console.log(error));
    api
      .get("listing/restore/?count")
      .then((response) => {
        setRestoreFilesCount(response.data["count"])
      })
      .catch((error) => console.log(error));
  }, []);


  return (
    <nav
      id="NavBar"
      className="flex border-b justify-between mb-4 px-5 sticky top-0 h-14 border-gray-gray bg-white  z-50"
    >
      <div className="flex items-center gap-4">

        {
          isLogOutConfirm && <LogOutConfirm isOpen={isLogOutConfirm} setIsOpen={setIsLogOutConfirm} />
        }
        {
          isSearch && <SearchButtonWithModal isOpen={isSearch} setIsOpen={setIsSearch} />
        }

        <Link
          id="home"
          className="inline-block border border-blue-400 rounded-lg py-1 px-3 bg-blue-400 text-white hover:bg-blue-700 active:ring-2"
          to="dashboard/"
        >
          داشبورد
        </Link>
        <Link
          id="home"
          className="inline-block border border-gray-50 rounded hover:border-gray-200 text-blue-500 hover:bg-gray-200 py-1 px-3 active:ring-2"
          to="/"
        >
          فایل ها
        </Link>
        <div className="relative inline-flex items-center">
          <Link
            id="listing"
            className="inline-block border border-gray-50 rounded hover:border-gray-200 text-blue-500 hover:bg-gray-200 py-1 px-3 active:ring-2"
            to="listing/"
          >
            ربات
          </Link>
          <span className="absolute top-0 right-0 text-xs font-bold text-red-500 w-4 h-4">

            {scannerFilesCount}
          </span>
        </div>
        <div className="relative inline-flex items-center">
          <Link
            id="restore"
            className="inline-block border border-gray-50 rounded hover:border-gray-200 text-blue-500 hover:bg-gray-200 py-1 px-3 active:ring-2"
            to="restore/"
          >
            احیا
          </Link>
          <span className="absolute top-0 right-0 text-xs font-bold text-red-500 w-4 h-4">

            {restoreFilesCount}
          </span>
        </div>
        <Link
          id="new_file"
          className="inline-block border border-gray-50 rounded hover:border-gray-200 text-blue-500 hover:bg-gray-200 py-1 px-3 active:ring-2"
          to="file/new"
        >
          فایل جدید
        </Link>
        <Link
          id="new_customer"
          className="inline-block border border-gray-50 rounded hover:border-gray-200 text-blue-500 hover:bg-gray-200 py-1 px-3 active:ring-2"
          to="customer/new"
        >
          مشتری جدید
        </Link>
        <Link
          id="customers"
          className="inline-block border border-gray-50 rounded hover:border-gray-200 text-blue-500 hover:bg-gray-200 py-1 px-3 active:ring-2"
          to="/customers"
        >
          مشتری ها
        </Link>
        <Link
          id="persons"
          className="inline-block border border-gray-50 rounded hover:border-gray-200 text-blue-500 hover:bg-gray-200 py-1 px-3 active:ring-2"
          to="persons/"
        >
          اشخاص
        </Link>
        <Link
          id="smsLogs"
          className="inline-block border border-gray-50 rounded hover:border-gray-200 text-blue-500 hover:bg-gray-200 py-1 px-3 active:ring-2"
          to="smsLogs/"
        >
          sms
        </Link>
        <button
          id="agents"
          className="inline-block border border-gray-50 rounded hover:border-gray-200 text-blue-500 hover:bg-gray-200 py-1 px-3 active:ring-2"
          onClick={() => {
            setIsLogOutConfirm(true)
          }}
        >
          خروج
        </button>

        <button
          id="agents"
          className="inline-block border border-gray-50 rounded hover:border-gray-200 text-blue-500 hover:bg-gray-200 py-1 px-3 active:ring-2"
          onClick={() => {
            setIsSearch(true)
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#60a5fa"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </button>
      </div>

    </nav>
  );
};

export default NavBar;
