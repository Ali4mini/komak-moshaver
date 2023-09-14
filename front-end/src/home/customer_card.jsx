import { Link } from "react-router-dom";
import elevator from "../assets/elevator.png";
import storage from "../assets/storage.png";
import parking from "../assets/car.png";

const customer = ({ customer }) => {
  return (
    <Link to={`/customer/${customer.customer_type}/${customer.id}`}>
      <div
        className={`${customer.status} block border-2 shadow-md rounded-2xl  hover:shadow-xl mx-4 py-1 my-2`}
      >
        <div className="flex flex-col" id="customer">
          <div className="flex flex-row gap-0">
            <p
              id="customer_id"
              className="flex justify-center m-auto h-auto shadow-md py-3 px-4 text-gray-500"
            >
              {customer.id}
            </p>
            <h1 className="flex text-sm truncate md:text-base max-h-sm w-full shadow-md py-3 px-4">
              {customer.customer_name}
            </h1>
          </div>
          <div className="grid grid-cols-3 text-sm md:grid-cols-7 md:text-base gap-2 max-w-2xl  py-3 px-4 ">
            {customer.customer_type === "sell" ? (
              <p>بودجه: {customer.price}</p>
            ) : (
              <>
                <p>ودیعه: {customer.price_up}</p>
                <p>اجاره: {customer.price_rent}</p>
              </>
            )}
            <p>متراژ: {customer.m2}</p>
            <p>ساخت: {customer.year}</p>
            <p>طبقه: {customer.floor}</p>
            <p>خواب: {customer.bedroom}</p>
            <p>واحد: {customer.vahedha}</p>
          </div>

          <div className="flex sm:flex-row justify-around  m p-2">
            {customer.elevator ? (
              <>
                <div className="flex flex-col">
                  <img src={elevator} alt="" width="30px" className="mx-auto" />
                </div>
              </>
            ) : null}
            {customer.parking ? (
              <>
                <div className="flex flex-col">
                  <img src={parking} alt="" width="30px" className="mx-auto" />
                </div>
              </>
            ) : null}
            {customer.storage ? (
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

export default customer;
