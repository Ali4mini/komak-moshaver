import { useState } from "react";
import FloatLabel from "../common/input";
import api from "../common/api";
import { useDispatch } from "react-redux";
import { setFiles } from "./filesSlice";

const Search = () => {
  const dispatch = useDispatch();
  const [searchField, setSearchField] = useState("id");
  const [key, setKey] = useState("");

  const filter = (key, e) => {
    e.preventDefault();
    api.get("listing/", {
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
      className="flex flex-col sm:flex-row border-r-2 py-2 gap-2 h-auto"
    >
      <select
        name="search"
        id="search"
        onChange={(e) => setSearchField(e.target.value)}
        className="mb-2 sm:mb-0 bg-white px-2 text-sm focus:ring-blue-300 text-center focus:border-blue-300 rounded-r-lg"
      >
        <option id="id" value="id">کد</option>
        <option id="name" value="owner_name">نام</option>
      </select>

      <input
        type={searchField === "id" ? "number" : "text"}
        className="border w-full sm:w-1/2 border-gray-400 rounded px-2"
        onChange={(e) => {
          setKey(e.target.value);
        }}
      />

      <button
        type="submit"
        className="mt-2 sm:mt-0 rounded-lg bg-blue-300 hover:bg-blue-400 border w-full sm:w-1/4"
      >
        جستجو
      </button>
    </form>
  );
};

export default Search;
