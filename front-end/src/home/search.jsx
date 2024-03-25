import { useState } from "react";
import FloatLabel from "../common/input";
import api from "../common/api";
import { useDispatch } from "react-redux";
import { setFiles } from "./filesSlice";

// search by code or name
const Search = () => {
  const dispatch = useDispatch();
  const [searchField, setSearchField] = useState("id");
  const [key, setKey] = useState(null);

  const filter = (key, e) => {
    e.preventDefault()
    api
      .get("listing/", {
        params: {
          [searchField]: key,
        },
      })
      .then((response) => {
        console.log(response.data);
        dispatch(setFiles(response.data));
      })
      .catch((error) => console.log(error));
  };
  return (
    <form
      onSubmit={(e) => filter(key, e)}
      id="filter_pk"
      className="flex border-r-2 py-2 justify-between gap-2 h-auto "
    >
      <select
        name="search"
        id="search"
        onChange={(e) => setSearchField(e.target.value)}
        className="bg-white px-2 text-sm focus:ring-blue-300 text-center focus:border-blue-300 rounded-r-lg"
      >
        <option id="id" value="id">
          کد
        </option>
        <option id="name" value="owner_name">
          نام
        </option>
      </select>

      <input
        type={searchField === "id" ? "number" : "text"}
        className="border w-1/2 border-gray-400 rounded px-2"
        onChange={(e) => {
          setKey(e.target.value);
        }}
      />
      <button
        type="submit"
        className=" rounded-lg bg-blue-300 hover:bg-blue-400 border w-1/4 bottom-0"
      >
        جستجو
      </button>
    </form>
  );
};

export default Search;
