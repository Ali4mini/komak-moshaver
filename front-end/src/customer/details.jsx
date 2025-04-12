import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../common/api";
import DeleteConfirm from "../common/delete_confim";
import car from "../assets/car.png";
import elevator from "../assets/elevator.png";
import storage from "../assets/storage.png";
import motor from "../assets/storage.png";
import MenuButton from "../common/dropdown_button";
import MatchedFiles from "../common/matched_files";

const CustomerDetail = () => {
  const navigate = useNavigate();
  const { customerType, id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [isDeleteConfirm, setIsDeleteConfirm] = useState(false);
  const [isMatchedFile, setIsMatchedFile] = useState(false);
  const [isFileOld, setIsFileOld] = useState(false)

  useEffect(() => {
    api
      .get(`customer/${customerType}/${id}/`)
      .then((response) => {
        setCustomer(response.data);
        const today = new Date().getTime()
        let updatedDate = new Date(response.data.updated).getTime(); // Use response.data directly
        const differenceInDays = (today - updatedDate) / (1000 * 3600 * 24);
        if (differenceInDays <= 30) {
          setIsFileOld(true)
        }

      });
  }, [id, customerType]);

  const features = [
    { feature: 'parking', image: car, text: 'پارکینگ دارد' },
    { feature: 'elevator', image: elevator, text: 'آسانسور دارد' },
    { feature: 'storage', image: storage, text: 'انباری دارد' },
    { feature: 'parking_motor', image: motor, text: 'پارکینگ موتور دارد' },
    { feature: 'komod_divari', image: car, text: 'کمددیواری دارد' },
  ];

  const optionItems = [
    {
      key: "updated",
      label: "موجود است",
      disabled: isFileOld,
      handler: () => {
        var now = new Date();
        api
          .patch(`customer/${customerType}/${id}/`, { updated_at: now })
          .then(navigate("/", { replace: true }))
          .catch((error) => console.log(error.data));
      },
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="white"
          className="w-6 h-6"
        >
          <path d="M12,2C6.48,2,2,6.48,2,12c0,5.52,4.48,10,10,10s10-4.48,10-10C22,6.48,17.52,2,12,2z M12.06,19v-2.01c-0.02,0-0.04,0-0.06,0 c-1.28,0-2.56-0.49-3.54-1.46c-1.71-1.71-1.92-4.35-0.64-6.29l1.1,1.1c-0.71,1.33-0.53,3.01,0.59,4.13c0.7,0.7,1.62,1.03,2.54,1.01 v-2.14l2.83,2.83L12.06,19z M16.17,14.76l-1.1-1.1c0.71-1.33,0.53-3.01-0.59-4.13C13.79,8.84,12.9,8.5,12,8.5c-0.02,0-0.04,0-0.06,0 v2.15L9.11,7.83L11.94,5v2.02c1.3-0.02,2.61,0.45,3.6,1.45C17.24,10.17,17.45,12.82,16.17,14.76z" />
        </svg>
      ),
    },
    {
      key: "matched_customers",
      label: "فایل های مرتبط",
      disabled: false,
      handler: () => {
        setIsMatchedFile(!isMatchedFile);
      },
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
      key: "delete",
      label: "حذف",
      disabled: false,
      style: "text-red-600 ",
      handler: () => {
        setIsDeleteConfirm(!isDeleteConfirm);
      },
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
    (
      <div
        id="customer-details" // Changed to a more descriptive ID
        className="flex border-2 w-auto bg-white rounded-lg mx-4 h-auto shadow-lg"
      >
        <div className="flex flex-col">
          <div className="grid grid-cols-3 gap-5 my-3 px-4">
            <p id="customerType">نوع فایل: {customerType === "buy" ? "فروش" : "اجاره"}</p>
            <p id="propertyType">نوع ملک: {customer?.property_type}</p>
            <p id="customerDate">تاریخ: {customer?.customer_date}</p>
            <p id="lastInquiry">آخرین استعلام: {customer?.persian_updated}</p>
            <p id="addedBy">ثبت شده توسط: {customer?.added_by}</p>
          </div>
          <div className="flex flex-row-2 gap-20 my-3 px-4">
            <p id="customerName">نام مشتری: {customer?.customer_name}</p>
            <p id="customerPhone">شماره مشتری: {customer?.customer_phone}</p>
          </div>
          <div className="grid grid-cols-4 flex-wrap gap-x-6 gap-y-3 my-3 px-4">
            <p id="area">متراژ: {customer?.m2}</p>
            {customerType === "buy" ? (
              <p id="budget">بودچه: {customer?.budget}</p>
            ) : (
              <>
                <p id="deposit">ودیعه: {customer?.up_budget}</p>
                <p id="rent">اجاره: {customer?.rent_budget}</p>
              </>
            )}
            <p id="yearBuilt">سال ساخت: {customer?.year}</p>
            <p id="bedrooms">تعداد اتاق خواب: {customer?.bedroom}</p>
            <p id="units">تعداد واحد: {customer?.vahedha}</p>
          </div>
          <div className="flex gap-20 my-3 px-4" id="featuresList">
            {features.map(({ feature, image, text }, index) => customer?.[feature] && (
              <div key={index} className="flex flex-col" id={`feature-${index}`}>
                <img src={image} alt="" width="40px" className="mx-auto" />
                <span>{text}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-row gap-10 my-3 px-4" id="descriptionSection">
            <p>توضیحات:</p>
            <p id="description">{customer?.description}</p>
          </div>
          <div className="flex flex-row justify-between my-3 px-4">

            {/* MenuButton component */}
            <MenuButton buttonText={"گزینه ها"} items={optionItems} />

            {/* Conditional components */}
            {isMatchedFile && (
              <MatchedFiles
                isOpen={isMatchedFile}
                setIsOpen={setIsMatchedFile}
              />
            )}

            {isDeleteConfirm && (
              <DeleteConfirm
                isOpen={isDeleteConfirm}
                setIsOpen={setIsDeleteConfirm}
                app={'customer'}
                model={customerType}
                id={id}
                title={"آیا از پاک کردن این مشتری مطمعنید؟"}
                description={
                  "اگر این مشتری را پاک کنید هیچ راهی برای بازگردانی آن ندارید!!"
                }
              />
            )}

            {/* Update button */}
            <button
              id="updateButton" // Changed to a more descriptive ID
              onClick={() => { navigate('edit/') }}
              className="text-white max-w-md bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
            >
              ویرایش
            </button>
          </div>
        </div>
      </div>
    )

  );
};

export default CustomerDetail;
