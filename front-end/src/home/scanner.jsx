import Filter from "./filter";
import File from "./property_card";
import { useEffect, useState } from "react";
import api from "../common/api";
import { setScannerFiles } from "./filesSlice";
import { useSelector, useDispatch } from "react-redux";
import ScrollButton from "../common/goUpButton";

const Scanner = () => {
  const store = useSelector((state) => state.files);
  const dispatch = useDispatch();

  useEffect(() => {
    api
      .get("listing/", { params: { owner_name: "UNKNOWN", status: "ACTIVE" } })
      .then((response) => {
        console.log(response.data)
        dispatch(setScannerFiles(response.data));
      })
      .catch((error) => console.log(error));
  }, []);

  return (
    <div className="home flex flex-col gap-3">
      {/* <Search /> */}
      <Filter />
      <div className="flex flex-col ">
        {store.scannerFiles ? (
          store.scannerFiles.map((item, index) => (
            <File key={index} file={item} />
          ))
        ) : (
          <p>no files was found</p>
        )}
      </div>
      <ScrollButton />
    </div>
  );
};

export default Scanner;
