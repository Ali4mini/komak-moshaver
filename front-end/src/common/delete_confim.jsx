import { useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import api from "./api";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setFlashMessage } from "./flashSlice";

const DeleteConfirm = ({ app, model, id, title, description }) => {
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const Delete = () => {
    console.log(`${app}/${model}/${id}/`);
    api
      .delete(`${app}/${model}/${id}/`)
      .then((response) => {
        navigate("/", { replace: true });
        dispatch(setFlashMessage({ type: "SUCCESS", message: "فایل حذف شد" }));
      })
      .catch((error) => console.log(`problem in DELETE request: ${error}`));
  };
  return (
    <>
      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

        <div className="fixed inset-0 flex items-center justigy-center">
          <Dialog.Panel className="flex flex-col gap-2 mx-auto w-1/2 px-5 py-2 max-w-sm rounded-lg bg-white">
            <Dialog.Title className="text-lg">{title}</Dialog.Title>
            <Dialog.Description className="text-gray-500 text-sm">
              {description}
            </Dialog.Description>
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
                پاک کن
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
};

export default DeleteConfirm;
