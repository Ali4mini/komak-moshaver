import { Link } from "react-router-dom";
import car from "../assets/car.png";
import elevator from "../assets/elevator.png";
import storage from "../assets/storage.png";
import parking from '../assets/car.png'

const File = ({ file }) => {
  return (
    <Link to={`file/${file.file_type}/${file.id}`}>
      <div className={`${file.status} block border-2 shadow-md rounded-2xl  hover:shadow-xl mx-4 py-1 my-2`}>
        <div className="flex flex-col" id="file">
          <div className="flex flex-row gap-0">
            <p
              id="file_id"
              className="flex justify-center m-auto h-auto shadow-md py-3 px-4 text-gray-500"
            >
              {file.id}
            </p>
            <h1 className="inline basis-full w-full shadow-md py-3 px-4">
              {file.address}
            </h1>
          </div>
          <div className="flex flex-row justify-between md:max-w-3xl py-6 px-4 ">
            {(file.file_type === 'sell') ? (
              <p>بودجه: {file.price}</p>
            ) : (
              <>
                <p>ودیعه: {file.price_up}</p>
                <p>اجاره: {file.price_rent}</p>
              </>
            )}
            <p>متراژ: {file.m2}</p>
            <p>سال ساخت: {file.year}</p>
            <p>طبقه: {file.floor}</p>
            <p>تعداد اتاق خواب: {file.bedroom}</p>
            <p>تعداد واحد: {file.vahedha}</p>
          </div>
          <div className="flex flex-row justify-around m p-2">
          {file.elevator ? (
              <>
                <div className="flex flex-col">
                  <img src={elevator} alt="" width="30px" className="mx-auto" />
                </div>
              </>
            ) : null}
            {file.parking ? (
              <>
                <div className="flex flex-col">
                  <img src={parking} alt="" width="30px" className="mx-auto" />
                </div>
              </>
            ) : null}
            {file.storage ? (
              <>
                <div className="flex flex-col">
                  <img src={storage} alt="" width="30px" className="mx-auto" />
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default File;
