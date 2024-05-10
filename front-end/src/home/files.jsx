import Filter from "./filter";
import File from "./property_card";
import { useEffect, useState } from "react";
import api from "../common/api";
import { setFiles } from "./filesSlice";
import { useSelector, useDispatch } from "react-redux";
import ScrollButton from "../common/goUpButton";

const Files = () => {
  const store = useSelector((state) => state.files);
  const dispatch = useDispatch();

  useEffect(() => {
    // this section is for when an agent requests files from another field or range
    if (store.lastFilter) {
      api
        .get(store.lastFilter)
        .then((response) => {
          dispatch(setFiles(response.data));
        })
        .catch((error) => console.log(error));
    } else {
      api
        .get("listing/", {
          params: {
            status: "ACTIVE",
            file_type: localStorage.getItem("agents_field"),
          },
        })
        .then((response) => {
          dispatch(setFiles(response.data));
        })
        .catch((error) => console.log(error));
    }
  }, []);

  return (
    <div className="home flex flex-col gap-3">
      <Filter />
      <div className="grid grid-cols-1 ">
        {store.files ? (
          store.files.map((item, index) => <File key={index} file={item} />)
        ) : (
          <p>no files was found</p>
        )}
      </div>


      <ScrollButton />
    </div>
  );


};

export default Files;
