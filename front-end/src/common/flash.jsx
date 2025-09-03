import { useDispatch } from "react-redux";
import { clearFlashMessage } from "./flashSlice";
import { useEffect, useState } from "react";
import { Transition } from "@headlessui/react";

const ShowMessage = ({ type, message }) => {
  const dispatch = useDispatch();
  const [flashMessage, setFlashMessage] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFlashMessage(false);
      dispatch(clearFlashMessage());
    }, 3000); // Display time for better visibility
    return () => clearTimeout(timer);
  }, [dispatch]);

  const colorClasses = {
    success: "bg-green-600 border-green-700",
    failure: "bg-red-500 border-red-600",
  };

  return (
    <Transition
      show={flashMessage}
      enter="transition-transform transition-opacity duration-500"
      enterFrom="translate-x-full opacity-0"
      enterTo="translate-x-0 opacity-100"
      leave="transition-transform transition-opacity duration-500"
      leaveFrom="translate-x-0 opacity-100"
      leaveTo="-translate-x-full opacity-0"
    >
      <div
        role="alert"
        className={`fixed z-50 bottom-4 right-4 p-16 font-bold text-lg text-white border-l-4 rounded-lg shadow-lg ${
          colorClasses[type] || colorClasses.success
        }`}
      >
        <p>{message}</p>
      </div>
    </Transition>
  );
};

export default ShowMessage;
