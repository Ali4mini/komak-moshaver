import File from "./property_card";
import { useEffect, useState } from "react";
import { api } from "../common/api";
import { addFiles, setFiles, } from "./filesSlice";
import { useSelector, useDispatch } from "react-redux";
import ScrollButton from "../common/goUpButton";
import Filter from "./filter";

const Files = () => {
  const store = useSelector((state) => state.files);
  const dispatch = useDispatch();
  const [pageNumber, setPageNumber] = useState(1);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const getFiles = (filter = { status: "ACTIVE", file_type: localStorage.getItem("agents_field") }) => {
    api.get(`/listing/?page=${pageNumber}`, { params: filter })
      .then((response) => {
        if (response.data.previous === null) {

          dispatch(setFiles(response.data.results));
        } else if (response.data.next) {

          dispatch(addFiles(response.data.results));
        }

        setIsFetchingMore(false)
      })
      .catch((error) => console.error(error));
  };

  // Initial fetch
  useEffect(() => {
    console.log(store)
    if (store.lastFilter) {
      getFiles(store.lastFilter)

    }
    else {

      getFiles();
    }
    console.log("Initial fetch triggered");
  }, [pageNumber]);

  // Fetch more on scroll
  useEffect(() => {

    const handleScroll = () => {
      const scrolledTo = window.scrollY + window.innerHeight;
      const isReachedBottom = document.body.scrollHeight === scrolledTo;

      if (isReachedBottom) {
        console.log("User has reached the bottom of the page.");
        setIsFetchingMore(true)
        setPageNumber(prevPageNumber => prevPageNumber + 1)

      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isFetchingMore]); // Correctly include isFetchingMore in the dependency array


  return (
    <div className="home flex flex-col gap-3">
      <Filter />
      <div className="grid grid-cols-1">
        {/* {isFetchingMore && <LoadingSpinner />} */}
        {store.files ? (
          store.files.map((file, index) => <File key={index} file={file} />)

        ) : (
          <p>No files were found</p>
        )}
      </div>
      <ScrollButton />
    </div>
  );
};

export default Files;
