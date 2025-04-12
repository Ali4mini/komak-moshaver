import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { api } from "../common/api";
import { Link } from "react-router-dom";
import PropTypes from 'prop-types';

const SearchItem = ({ name, address, id, type, hasNotified, fileOrCustomerType }) => {
  return (
    <div className="flex flex-row p-2 align-middle items-center justify-between border-b border-gray-200 hover:bg-gray-100 transition duration-150 ease-in-out">
      <Link to={`/${type}/${fileOrCustomerType}/${id}`}>
        <div className={`flex flex-col ${hasNotified ? 'text-gray-400 line-through' : 'text-black'}`}>
          <h3 className="text-base sm:text-lg font-semibold">{name}</h3>
          {address && <p className="text-xs sm:text-sm text-gray-500">{address}</p>}
        </div>
      </Link>
      <input
        type="checkbox"
        className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded"
        defaultChecked={hasNotified}
      />
    </div>
  );
};

SearchItem.propTypes = {
  name: PropTypes.string.isRequired,
  address: PropTypes.string,
  id: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  hasNotified: PropTypes.bool.isRequired,
  fileOrCustomerType: PropTypes.string.isRequired,
};

const Search = ({ isOpen, setIsOpen }) => {
  const [searchParams, setSearchParams] = useState({
    subject: "owner",
    field: "id",
    key: "",
  });
  const [result, setResult] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({ ...prev, [name]: value }));

    if (name === "subject") {
      setSearchParams((prev) => ({ ...prev, field: value === "owner" ? "id" : "customer_name", key: "" }));
    }
  };

  const filterResults = async (e) => {
    e.preventDefault();
    const endpoint = searchParams.subject === "owner" ? "/listing/" : "/listing/customers";

    setLoading(true); // Start loading

    try {
      const response = await api.get(endpoint, {
        params: { [searchParams.field]: searchParams.key },
      });
      setResult(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false); // End loading
    }
  };

  return (
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
      <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50 max-h-[80vh]">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center">
          <Dialog.Panel className="flex flex-col gap-4 mx-auto w-full max-w-md px-6 py-4 rounded-lg bg-white shadow-lg">
            <Dialog.Title className="text-xl font-bold">جستجو</Dialog.Title>
            <form onSubmit={filterResults} className="flex flex-col gap-2">
              {/* Select Boxes */}
              <div className="flex flex-col sm:flex-row gap-2">
                <label htmlFor="subject" className="text-sm text-gray-600 font-bold text-center flex items-center">جستجو در:</label>
                <select
                  name="subject"
                  id="subject"
                  value={searchParams.subject}
                  onChange={handleSearchChange}
                  className="bg-white px-3 py-2 text-sm border border-gray-300 rounded focus:ring-blue-300 focus:border-blue-300 transition duration-150 ease-in-out w-full sm:w-auto mb-2"
                >
                  <option value="owner">فایل ها</option>
                  <option value="customer">مشتریان</option>
                </select>
                <label htmlFor="field" className="text-sm text-gray-600 font-bold text-center flex items-center">پارامتر:</label>
                <select
                  name="field"
                  id="field"
                  value={searchParams.field}
                  onChange={handleSearchChange}
                  className="bg-white px-3 py-2 text-sm border border-gray-300 rounded focus:ring-blue-300 focus:border-blue-300 transition duration-150 ease-in-out w-full sm:w-auto mb-2"
                >
                  {searchParams.subject === "owner" ? (
                    <>
                      <option value="id">کد</option>
                      <option value="owner_name__icontains">نام فایل</option>
                    </>
                  ) : (
                    <>
                      <option value="id">کد</option>
                      <option value="customer_name__icontains">نام مشتری</option>
                    </>
                  )}
                </select>
              </div>

              {/* Input Field and Button */}
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type={searchParams.field === "id" ? "number" : "text"}
                  name="key"
                  id="key"
                  value={searchParams.key}
                  onChange={handleSearchChange}
                  className="border w-full sm:w-auto border-gray-400 rounded px-3 py-2 focus:ring-blue-300 focus:border-blue-300 transition duration-150 ease-in-out mb-2"
                />
                <button
                  type="submit"
                  className="h-full rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-[10px] transition duration-150 ease-in-out w-full sm:w-auto"
                >
                  جستجو
                </button>
              </div>

              {/* Loader */}
              {loading && (
                <div className="flex justify-center items-center py-4">
                  {/* Tailwind CSS Spinner */}
                  <svg
                    role="status"
                    className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                    viewBox="0 0 100 101"
                    xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M50.5 1C22.7 1 1.5 22.2 1.5 50S22.7 99 50.5 99c27.8 0 49.5 -21.2 49.5 -49S78.3 1 50.5 1zM50.5 93c -23.4 0 -42.5 -19.1 -42.5 -43S27.1 7 50.5 7c23.4 0 42.5 19.1 42.5 43S73.9 93 50.5 93z"
                      fill="#3498db" />
                    <path
                      d="M93.9 50c0 -24 -19.4 -43 -43 -43v6c20.4 0 37 16.6 37 37s -16.6 37 -37 37v6c23.6 .1 43 -18.9 43 -43z"
                      fill="#3498db" />
                  </svg>
                </div>
              )}
            </form>

            {/* Updated results container */}
            <div id="results" className={`flex flex-col p-[10px] h-[300px] max-h-[400px] overflow-y-auto border gap-y-px ${loading ? 'opacity-50' : ''}`}>
              {result.length > 0 ? (
                result.map(item => (
                  <SearchItem
                    key={`${item.file_type}_${item.id}`}
                    name={item.owner_name || item.customer_name}
                    address={item.address || item.customer_phone}
                    id={item.id}
                    type={item.file_type ? 'file' : 'customer'}
                    fileOrCustomerType={item.file_type || item.customer_type}
                    hasNotified={false} // Adjust this based on your logic
                  />
                ))
              ) : !loading ? (
                <p className="text-center text-gray-500">نتیجه‌ای یافت نشد.</p> // No results message
              ) : null}
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </Transition >
  );
};

export default Search;
