import { Link } from "react-router-dom";
import Search from "../home/search";

const NavBar = () => {
  return (
    <nav id="NavBar" className="flex border-b justify-between mb-4 px-5 sticky top-0 h-14 border-gray-gray bg-white  z-50">
      <div className="flex items-center gap-4">
        <Link
          id="home"
          className="inline-block border border-blue-400 rounded-lg py-1 px-3 bg-blue-400 text-white hover:bg-blue-700 active:ring-2"
          to="/"
        >
          خانه
        </Link>
        <Link
          id="listing"
          className="inline-block border border-gray-50 rounded hover:border-gray-200 text-blue-500 hover:bg-gray-200 py-1 px-3 active:ring-2"
          to="listing"
        >
          لیست
        </Link>
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
          id="agents"
          className="inline-block border border-gray-50 rounded hover:border-gray-200 text-blue-500 hover:bg-gray-200 py-1 px-3 active:ring-2"
          to="agents/login"
        >
          ورود
        </Link>
      </div>
      <Search />
    </nav>
  );
};

export default NavBar;
