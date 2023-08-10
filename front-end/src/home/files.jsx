import Filter from "./filter";
import PkFilter from "./pk_filter";
import File from "./property_card";
import { useEffect, useState } from "react";
import api from "../common/api";
import { setFiles } from "./filesSlice";
import { useSelector, useDispatch } from "react-redux";

const Files = () => {
  const store = useSelector((state) => state.files);
  const dispatch = useDispatch();

  useEffect(() => {
    api
      .get("listing/", {params: {
        status: 'ACTIVE'
      }})
      .then((response) => {
        console.log(response.data);
        dispatch(setFiles(response.data));
      })
      .catch((error) => console.log(error));
  }, []);

  return (
    <div className="home flex flex-col gap-3">
      <PkFilter />
      <Filter />
      <div className="flex flex-col ">
        {store.files ? (
          store.files.map((item, index) => <File key={index} file={item} />)
        ) : (
          <p>no files was found</p>
        )}
      </div>
    </div>
  );
};

export default Files;
