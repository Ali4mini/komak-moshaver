import { useState } from "react";
import FloatLabel from "../common/input";
import api from "../common/api";

const PkFilter = ({ setter }) => {
  const [pk, setPk] = useState(null);

  const filter = (pk) => {
    api
      .get("customers/", {
        params: {
          id: pk,
        },
      })
      .then((response) => setter(response.data))
      .catch((error) => console.log(error));
  };
  return (
    <div
      id="filter_pk"
      className="flex border-2 w-1/2 rounded-xl mx-4 px-3 py-5 h-auto gap-2 shadow"
    >
      <select
        name="file_type"
        id="filter_file_type"
        className="bg-gray-50 border focus:ring-blue-300 text-center focus:border-blue-300 shadow-md w-32 h-10 rounded-lg"
      >
        <option id="pk_buy" value="buy">
          خرید
        </option>
        <option id="pk_rent" value="rent">
          اجاره
        </option>
        #
      </select>

      <FloatLabel label="کد مشتری" setter={setPk} type="text" />
      <button
        onClick={() => filter(pk)}
        className="w-1/2  h-10 rounded-lg hover:bg-blue-400 bg-blue-300 border bottom-0"
      >
        فیلتر
      </button>
    </div>
  );
};

export default PkFilter;
