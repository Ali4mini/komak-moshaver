import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../common/api";
import DeleteConfirm from "../common/delete_confim";
import car from "../assets/car.png";
import elevator from "../assets/elevator.png";
import storage from "../assets/storage.png";
import motor from "../assets/storage.png";

const CustomerDetail = () => {
  const navigate = useNavigate();
  const { customerType, id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [isDeleteconfirm, setIsDeleteConfirm] = useState(false);

  useEffect(() => {
    api
      .get(`customer/${customerType}/${id}/`)
      .then((response) => setCustomer(response.data));
  }, []);

  const features = [
    { feature: 'parking', image: car, text: 'پارکینگ دارد' },
    { feature: 'elevator', image: elevator, text: 'آسانسور دارد' },
    { feature: 'storage', image: storage, text: 'انباری دارد' },
    { feature: 'parking_motor', image: motor, text: 'پارکینگ موتور دارد' },
    { feature: 'komod_divari', image: car, text: 'کمددیواری دارد' },
  ];

  return (
    <div
      id="details"
      className="flex border-2 w-auto bg-white rounded-lg mx-4 h-auto shadow-lg"
    >
      <div className="flex flex-col">
        <div className="flex flex-row-2 gap-20 my-3 px-4">
          <p>نوع فایل: {customerType === "buy" ? "فروش" : "اجاره"}</p>
          <p>نوع ملک: {customer?.type}</p>
        </div>
        <div className="flex flex-row-2 gap-20 my-3 px-4">
          <p>نام مشتری: {customer?.customer_name}</p>
          <p>شماره مشتری: {customer?.customer_phone}</p>
        </div>
        <div className="grid grid-cols-4 flex-wrap gap-x-6 gap-y-3 my-3 px-4">
          <p>متراژ: {customer?.m2}</p>
          {customerType === "buy" ? (
            <p>بودچه: {customer?.budget}</p>
          ) : (
            <>
              <p>ودیعه: {customer?.up_budget}</p>
              <p>اجاره: {customer?.rent_budget}</p>
            </>
          )}

          <p>سال ساخت: {customer?.year}</p>
          <p>تعداد اتاق خواب: {customer?.bedroom}</p>
          <p>تعداد واحد: {customer?.vahedha}</p>
        </div>
        <div className="flex gap-20 my-3 px-4">
          {features.map(({ feature, image, text }, index) => customer?.[feature] && (
            <div key={index} className="flex flex-col">
              <img  src={image} alt="" width="40px" className="mx-auto" />
              <span>{text}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-row justify-between my-3 px-4">
          <button
            id="delete"
            onClick={() => setIsDeleteConfirm(!isDeleteconfirm)}
            className="focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
          >
            حذف
          </button>
          {isDeleteconfirm && (
            <DeleteConfirm
              app={'customer'}
              model={customerType}
              id={id}
              title={"آیا از پاک کردن این مشتری مطمعنید؟"}
              description={
                "اگر این مشتری را پاک کنید هیچ راهی برای بازگردانی آن ندارید!!"
              }
            />
          )}

          <button
            id="update"
            onClick={() => { navigate('edit/') }}
            className="text-white max-w-md bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
          >
            ویرایش
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetail;
