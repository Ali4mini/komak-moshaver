import { useState, Fragment, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import api from "./api";
import { Link, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  setRelatedFiles,
  addToFilesToNotify,
  removeFromFilesToNotify,
} from "../customer/customerSlice";

const File = ({ fileName, fileAddress, fileId, fileType, hasNotified }) => {
  console.log(fileAddress)
  const dispatch = useDispatch();

  const handleCheckboxChange = (e) => {
    console.log(`in handler ${fileId}`);
    if (e.target.checked) {
      dispatch(addToFilesToNotify(fileId));
    } else {
      dispatch(removeFromFilesToNotify(fileId));
    }
  };

  return (
    <div className="flex flex-row p-1 align-middle items-center justify-between ">

      <Link key={fileId} to={`/file/${fileType}/${fileId}/`}>
        {hasNotified ? (

          <div className="flex flex-col">
            <h3 className="text-lg text-gray-400 line-through">{fileName}</h3>
            <p className="text-sm text-gray-400 line-through">{fileAddress}</p>
          </div>
        ) : (
          <div className="flex flex-col">
            <h3 className="text-lg text-black">{fileName}</h3>
            <p className="text-sm text-gray-400">{fileAddress}</p>
          </div>
        )}
      </Link>

      <input
        type="checkbox"
        onChange={handleCheckboxChange}
        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded "
        defaultChecked={hasNotified}
      />
    </div>
  );
};

const MatchedFiles = ({ isOpen, setIsOpen, notifiedfiles }) => {
  const dispatch = useDispatch();
  const store = useSelector((state) => state.customer);
  const filesList = store.relatedFiles;
  const filesToNotify = store.filesToNotify;

  const location = useLocation();

  const notifyfiles = () => {
    console.log(filesToNotify);
    api
      .patch(`${location.pathname}/`, { notified_files: filesToNotify })
      .then((response) => {
        console.log(response.data);
        setIsOpen(false);
      })
      .catch((error) => console.log(error));
  };
  useEffect(() => {
    const apiUrl = `${location.pathname}/related_files/`;
    api
      .get(apiUrl)
      .then((response) => {
        console.log(response.data)
        dispatch(setRelatedFiles(response.data));
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

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
          size="sm"
          className="relative z-50"
        >
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

          <div className="fixed inset-0 flex items-center justigy-center">
            <Dialog.Panel className="flex flex-col gap-2 h-5/6 mx-auto  px-5 py-2 max-w-md rounded-lg bg-white">
              <Dialog.Title className="text-lg">فایل های مرتبط</Dialog.Title>
              <div
                id="files"
                className="flex flex-col p-2 h-full rounded-md overflow-y-scroll border gap-2"
              >
                {filesList?.map((file) => (


                  <File
                    fileName={file.owner_name}
                    fileAddress={file.address}
                    fileId={file.id}
                    fileType={file.file_type}
                    hasNotified={false}
                    key={file.id}
                  />
                ))}
              </div>
              <div
                id="actions"
                className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between mt-4"
              >
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-3 sm:px-4 text-xs md:text-base h-10 rounded-lg bg-blue-400"
                >
                  لغو
                </button>
                <button
                  onClick={() => notifyfiles()}
                  className="px-3 sm:px-4 text-xs md:text-base h-10 rounded-lg bg-yellow-400"
                >
                  اطلاع رسانی انجام شد
                </button>
                <button
                  className="px-3 sm:px-4 text-xs md:text-base h-10 rounded-lg bg-red-400 cursor-not-allowed opacity-50"
                >
                  اطلاع رسانی کن
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog >
      </Transition >
    </>
  );
};

export default MatchedFiles;
