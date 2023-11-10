import { Link } from "react-router-dom";
import Search from "../home/search";
import { useState } from "react";
import { Transition } from "@headlessui/react";

const MobileNavBar = () => {
  const [isActive, setIsActive] = useState(false);

  return (
    <>
      <div className="flex justify-between py-2 px-5 w-full">
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
        enter="transition-opacity duration-500"
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
            لیست
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
        </div>
      </Transition>
    </>
  );
};

export default MobileNavBar;
