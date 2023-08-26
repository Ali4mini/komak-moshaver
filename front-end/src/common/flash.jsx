import { useDispatch, useSelector } from "react-redux";
import { clearFlashMessage } from "./flashSlice";
import { useEffect, useState } from "react";
import { Transition } from "@headlessui/react";

const ShowMessage = ({ type, message }) => {
  console.log(message);
  const dispatch = useDispatch();
  const [flashMessage, setFlashMessage] = useState(true);
  console.log(flashMessage);
  useEffect(() => {
    const timer = setTimeout(() => {
      setFlashMessage(false);
      dispatch(clearFlashMessage());
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const colorClasses = {
    success: "bg-green-400",
    failure: "bg-red-400",
  };

  return (
    <Transition
      show={flashMessage}
      enter="transition-opacity duration-500"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="transition-opacity duration-500"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div
        className={`p-2 my-2 mx-6 text-black rounded-lg ${
          colorClasses[type] || colorClasses.success
        }`}
      >
        <p className="text-lg">{message}</p>
      </div>
    </Transition>
  );
};

export default ShowMessage;
