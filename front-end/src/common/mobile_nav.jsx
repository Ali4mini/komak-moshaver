import { Link } from "react-router-dom";
import { useState } from "react";
import { Transition } from "@headlessui/react";
import SearchButtonWithModal from '../home/search.jsx'

const MobileNavBar = () => {
  const [isActive, setIsActive] = useState(false);
  const [isSearch, setIsSearch] = useState(false);

  return (
    <>
      <div className="flex justify-between py-2 px-5 w-full">

        {
          isSearch && <SearchButtonWithModal isOpen={isSearch} setIsOpen={setIsSearch} />
        }
        <Link
          id="home"
          className="inline-block border border-blue-400 rounded-lg py-1 top-0 px-3 bg-blue-400 text-white hover:bg-blue-700 active:ring-2"
          to="/"
        >
          خانه
        </Link>
        <button
          className="flex flex-col justify-center h-auto gap-1 w-6"
          onClick={() => setIsActive(!isActive)}
        >
          {isActive ? (
            <p className="close-btn"></p>
          ) : (
            <>
              <p className="w-full h-0.5 bg-black"></p>
              <p className="w-full h-0.5 bg-black"></p>
              <p className="w-3/4 h-0.5 bg-black mr-auto"></p>
            </>
          )}
        </button>
      </div>
      <Transition
        show={isActive}
        enter="transition-opacity duration-700"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-400"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="flex flex-col-reverse border-b-2 border-gray-300 mb-3 rounded-b-lg w-full items-center ">

          <Link
            id="listing"
            className="flex w-full justify-center border border-gray-50 rounded hover:border-gray-200 text-blue-500 hover:bg-gray-200 py-1 px-3 active:ring-2"
            to="listing"
            onClick={() => setIsActive(!isActive)}
          >
            ربات
          </Link>

          <Link
            id="new_file"
            className="flex w-full justify-center border border-gray-50 rounded hover:border-gray-200 text-blue-500 hover:bg-gray-200 py-1 px-3 active:ring-2"
            to="file/new"
            onClick={() => setIsActive(!isActive)}
          >
            فایل جدید
          </Link>
          <Link
            id="new_customer"
            className="flex w-full justify-center border border-gray-50 rounded hover:border-gray-200 text-blue-500 hover:bg-gray-200 py-1 px-3 active:ring-2"
            to="customer/new"
            onClick={() => setIsActive(!isActive)}
          >
            مشتری جدید
          </Link>
          <Link
            id="customers"
            className="flex w-full justify-center border border-gray-50 rounded hover:border-gray-200 text-blue-500 hover:bg-gray-200 py-1 px-3 active:ring-2"
            to="/customers"
            onClick={() => setIsActive(!isActive)}
          >
            مشتری ها
          </Link>
          <button
            id="agents"
            className="flex w-full justify-center border border-gray-50 rounded hover:border-gray-200 text-blue-500 hover:bg-gray-200 py-1 px-3 active:ring-2"
            onClick={() => {
              setIsActive(!isActive);
              localStorage.clear();
              window.location.reload();
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
      </Transition>
    </>
  );
};

export default MobileNavBar;
