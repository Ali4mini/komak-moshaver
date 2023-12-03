import { Link } from "react-router-dom";
import elevator from "../assets/elevator.png";
import storage from "../assets/storage.png";
import parking from "../assets/car.png";

const File = ({ file }) => {
  const updatedDate = new Date(file.updated);
  const currentDate = new Date();
  const diffTime = Math.abs(currentDate - updatedDate);
  const diffdays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return (
    <Link to={`file/${file.file_type}/${file.id}`}>
      <div
        className={`${
          diffdays > 30 ? "bg-yellow-200" : file.status
        } block border-2 shadow-md rounded-2xl  hover:shadow-xl mx-4 py-1 my-2`}
      >
        <div className="flex flex-col" id="file">
          <div className="flex flex-row gap-0">
            <p
              id="file_id"
              className="flex justify-center m-auto h-auto shadow-md py-3 px-4 text-gray-500"
            >
              {file.id}
            </p>
            <h1 className="flex text-sm truncate md:text-base max-h-sm w-full shadow-md py-3 px-4">
              {file.address}
            </h1>
          </div>
          <div className="grid grid-cols-3 text-sm md:grid-cols-7 md:text-base gap-2 max-w-2xl  py-3 px-4 ">
            {file.file_type === "sell" ? (
              <p>بودجه: {file.price}</p>
            ) : (
              <>
                <p>ودیعه: {file.price_up}</p>
                <p>اجاره: {file.price_rent}</p>
              </>
            )}
            <p>متراژ: {file.m2}</p>
            <p>ساخت: {file.year}</p>
            <p>طبقه: {file.floor}</p>
            <p>خواب: {file.bedroom}</p>
            <p>واحد: {file.vahedha}</p>
          </div>

          <div className="flex sm:flex-row justify-around  m p-2">
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
