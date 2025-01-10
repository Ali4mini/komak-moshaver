import Filter from "./filter";
import File from "./property_card";
import { useEffect, useState } from "react"; // Import useState
import { api } from "../common/api";
import { setRestoreFiles, addRestoreFiles } from "./filesSlice";
import { useSelector, useDispatch } from "react-redux";
import ScrollButton from "../common/goUpButton";

const Restore = () => {
  const store = useSelector((state) => state.files);
  const dispatch = useDispatch();
  const [pageNumber, setPageNumber] = useState(1); // Initialize pageNumber state
  const [isFetchingMore, setIsFetchingMore] = useState(false); // Initialize isFetchingMore state

  useEffect(() => {
    api
      .get(`listing/restore?page=${pageNumber}`) // Append page parameter to the API call
      .then((response) => {
        console.log(response.data);
        if (response.data.previous === null) {

          dispatch(setRestoreFiles(response.data.results));
        } else if (response.data.next) {

          dispatch(addRestoreFiles(response.data.results));
        }
      })
      .catch((error) => console.log(error));
  }, [dispatch, pageNumber]); // Add pageNumber as a dependency

  // Fetch more on scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrolledTo = window.scrollY + window.innerHeight;
      const isReachedBottom = document.body.scrollHeight === scrolledTo;

      if (isReachedBottom) {
        console.log("User has reached the bottom of the page.");
        setPageNumber(prevPageNumber => prevPageNumber + 1); // Increment pageNumber to fetch the next page
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isFetchingMore]); // Include isFetchingMore in the dependency array

  return (
    <div className="home flex flex-col gap-3">
      <Filter />
      <div className="flex flex-col ">
        {store.restoreFiles ? (
          store.restoreFiles.map((item, index) => (
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

export default Restore;
