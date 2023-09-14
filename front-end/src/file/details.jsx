import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../common/api";
import DeleteConfirm from "../common/delete_confim";
import car from "../assets/car.png";
import elevator from "../assets/elevator.png";
import storage from "../assets/storage.png";
import motor from "../assets/storage.png";

const FileDetails = () => {
  const navigate = useNavigate();
  const { fileType, id } = useParams();
  const [file, setFile] = useState(null);
  const [isDeleteconfirm, setIsDeleteConfirm] = useState(false);

  useEffect(() => {
    api
      .get(`file/${fileType}/${id}/`)
      .then((response) => setFile(response.data));
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
          {features.map(({ feature, image, text }, index) => file?.[feature] && (
            <div key={index} className="flex flex-col">
              <img src={image} alt="" width="40px" className="mx-auto" />
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
              app={'file'}
              model={fileType}
              id={id}
              title={"آیا از پاک کردن این فایل مطمعنید؟"}
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

export default FileDetails;
