import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

const LogOutConfirm = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const Delete = () => {
    console.log(location.pathname);
    window.localStorage.clear()
    window.location.reload()
  };
  return (
    <>
      <Transition
        show={isOpen}
        enter="transition duration-100 ease-out"
        enterFrom="transform scale-95 opacity-0"
        enterTo="transform scale-100 opacity-100"
        leave="transition duration-75 ease-out"
        leaveFrom="transform scale-100 opacity-100"
        leaveTo="transform scale-95 opacity-0"
        as={Fragment}
      >
        <Dialog
          open={isOpen}
          onClose={() => setIsOpen(false)}
          className="relative z-50"
        >
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

          <div className="fixed inset-0 flex items-center justigy-center">
            <Dialog.Panel className="flex flex-col gap-2 mx-auto w-1/2 px-5 py-2 max-w-sm rounded-lg bg-white">
              <Dialog.Title className="text-lg">
                از خروج خود مطمئن هستید؟
              </Dialog.Title>
              {/* <Dialog.Description className="text-gray-500 text-sm"> */}
              {/*   اگر فایل را اشتباهی پاک کردید سریعا به مدیر مجموعه اطلاع رسانی */}
              {/*   کنید */}
              {/* </Dialog.Description> */}
              <div id="actions" className="flex flex-row justify-between mt-4">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-3 w-24 h-10 rounded-lg bg-blue-400"
                >
                  لغو
                </button>
                <button
                  onClick={() => Delete()}
                  className="px-3 w-24 h-10 rounded-lg bg-red-400"
                >
                  خروج
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default LogOutConfirm;
