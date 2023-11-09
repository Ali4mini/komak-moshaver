import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../common/api";
import DeleteConfirm from "../common/delete_confim";
import car from "../assets/car.png";
import elevator from "../assets/elevator.png";
import storage from "../assets/storage.png";
import motor from "../assets/storage.png";
import MenuButton from "../common/dropdown_button";
import MatchedCustomers from "../common/matched_customers";

const FileDetails = () => {
  const navigate = useNavigate();
  const { fileType, id } = useParams();
  const [file, setFile] = useState(null);
  const [isDeleteConfirm, setIsDeleteConfirm] = useState(false);
  const [isMatchedCustomer, setIsMatchedCustomer] = useState(false);

  useEffect(() => {
    api
      .get(`file/${fileType}/${id}/`)
      .then((response) => setFile(response.data));
  }, []);

  const features = [
    { feature: "parking", image: car, text: "پارکینگ دارد" },
    { feature: "elevator", image: elevator, text: "آسانسور دارد" },
    { feature: "storage", image: storage, text: "انباری دارد" },
    { feature: "parking_motor", image: motor, text: "پارکینگ موتور دارد" },
    { feature: "komod_divari", image: car, text: "کمددیواری دارد" },
  ];

  const optionItems = [
    {
      key: "print",
      label: "چاپ فایل",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="w-5 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z"
          />
        </svg>
      ),
    },
    {
      handler: () => {
        setIsMatchedCustomer(!isMatchedCustomer);
      },
      key: "matched_customers",
      label: "مشتریان مرتبط",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
          />
        </svg>
      ),
    },
    {
      handler: () => {
        setIsDeleteConfirm(!isDeleteConfirm);
      },
      key: "delete",
      label: "حذف",
      style: "text-red-600 ",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="w-5 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
          />
        </svg>
      ),
    },
  ];

  return (
    <div
      id="details"
      className="grid border-2 text-sm md:text-base bg-white rounded-lg mx-4 h-auto shadow-lg"
    >
      <div className="flex flex-col">
        <div className="flex flex-row-2 gap-20 my-3 px-4">
          <p>نوع فایل: {fileType === "sell" ? "فروش" : "اجاره"}</p>
          <p>نوع ملک: {file?.property_type}</p>
        </div>
        <div className="flex flex-row-2 gap-20 my-3 px-4">
          <p>نام مالک: {file?.owner_name}</p>
          <p>شماره مالک: {file?.owner_phone}</p>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-5 max-w-md gap-x-6 gap-y-3 my-3 px-4">
          <p>متراژ: {file?.m2}</p>
          {fileType === "sell" ? (
            <p>قیمت: {file?.price}</p>
          ) : (
            <>
              <p>ودیعه: {file?.price_up}</p>
              <p>اجاره: {file?.price_rent}</p>
            </>
          )}

          <p>ساخت: {file?.year}</p>
          <p>طبقه: {file?.floor}</p>
          <p>طبقات: {file?.tabaghat}</p>
          <p>خواب: {file?.bedroom}</p>
          <p>واحد: {file?.vahedha}</p>
          <p>تبدیل: {file?.tabdil}</p>
        </div>
        <div className="flex flex-row my-3 px-4">
          <p>بازدید: {file?.bazdid}</p>
        </div>
        <div className="flex flex-row gap-20 my-3 px-4">
          <p>شماره مستاجر: {file?.tenet_phone}</p>
          <p>نام مستاجر: {file?.tenet_name}</p>
        </div>
        <div className="flex flex-row gap-20 my-3 px-4">
          <p>آدرس: {file?.address}</p>
        </div>
        <div className="flex gap-20 my-3 px-4">
          {features.map(
            ({ feature, image, text }, index) =>
              file?.[feature] && (
                <div key={index} className="flex flex-col">
                  <img src={image} alt="" width="40px" className="mx-auto" />
                  <span>{text}</span>
                </div>
              )
          )}
        </div>
        <div className="flex flex-row justify-between my-3 px-4">
          <MenuButton buttonText={"گزینه ها"} items={optionItems} />

          {isMatchedCustomer && (
            <MatchedCustomers
              isOpen={isMatchedCustomer}
              setIsOpen={setIsMatchedCustomer}
              notifiedCustomers={file.notified_customers}
            />
          )}

          {isDeleteConfirm && (
            <DeleteConfirm
              isOpen={isDeleteConfirm}
              setIsOpen={setIsDeleteConfirm}
              
              title={"آیا از پاک کردن این فایل مطمعنید؟"}
              description={
                "اگر فایل را اشتباهی پاک کردید سریعا به مدیر مجموعه اطلاع رسانی کنید"
              }
            />
          )}

          <button
            id="update"
            onClick={() => {
              navigate("edit/");
            }}
            className="text-white max-w-md bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
          >
            ویرایش
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileDetails;
