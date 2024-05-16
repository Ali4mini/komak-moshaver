import { Link } from "react-router-dom";
import Search from "../home/search";
import { useEffect, useState } from "react";
import api from "./api";
import { useDispatch } from "react-redux";
import LogOutConfirm from "./logout_confirm";

const NavBar = () => {
  const dispatch = useDispatch()
  const [scannerFilesCount, setScannerFilesCount] = useState(0)
  const [isLogOutConfirm, setIsLogOutConfirm] = useState(false);

  // count of divar bot added files
  useEffect(() => {
    api
      .get("listing/?count", { params: { owner_name: "UNKNOWN", status: "ACTIVE", "count": null } })
      .then((response) => {
        setScannerFilesCount(response.data["count"])
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
        <button
          id="agents"
          className="inline-block border border-gray-50 rounded hover:border-gray-200 text-blue-500 hover:bg-gray-200 py-1 px-3 active:ring-2"
          onClick={() => {
            setIsLogOutConfirm(true)
          }}
        >
          خروج
        </button>
      </div>

      <Search />
    </nav>
  );
};

export default NavBar;
