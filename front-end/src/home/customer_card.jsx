import { Link } from "react-router-dom";
import car from "../assets/car.png";
import elevator from "../assets/elevator.png";
import storage from "../assets/storage.png";
import parking from '../assets/car.png'

const Customer = ({ customer }) => {
  return (
    <Link to={`/customer/${customer.customer_type}/${customer.id}`}>
      <div className="block border-2 shadow-md rounded-2xl bg-gray-50 hover:bg-gray-100 hover:shadow-xl mx-4 py-1 my-2">
        <div className="flex flex-col" id="customer">
          <div className="flex flex-row gap-0">
            <p
              id="customer_id"
              className="flex justify-center m-auto h-auto shadow-md py-3 px-4 text-gray-500"
            >
              {customer.id}
            </p>
            <h1 className="inline basis-full w-full shadow-md py-3 px-4">
              {customer.customer_name}
            </h1>
          </div>
          <div className="flex flex-row gap-20 py-6 px-4 shadow">
            {(customer.customer_type === 'buy') ? (
              <p>بودجه: {customer.budget}</p>
            ) : (
              <>
                <p>ودیعه: {customer.up_budget}</p>
                <p>اجاره: {customer.rent_budget}</p>
              </>
            )}
            <p>سال ساخت: {customer.year}</p>
            <p>تعداد اتاق خواب: {customer.bedroom}</p>
            <p>تعداد واحد: {customer.vahedha}</p>
          </div>
          <div className="flex flex-row justify-around p-2">
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

export default Customer;
