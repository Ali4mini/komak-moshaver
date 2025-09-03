// File: Files.jsx
import FileCard from "./property_card";
import { useEffect, useState, useCallback, useRef, useMemo } from "react"; // Added useMemo
import { api } from "../common/api";
import { addFiles, setFiles } from "./filesSlice";
import { useSelector, useDispatch } from "react-redux";
import ScrollButton from "../common/goUpButton";
import Filter from "./filter";
import BeatLoader from "react-spinners/BeatLoader";
import { FiHome, FiFilter, FiX } from "react-icons/fi";

const Files = () => {
  const { files, lastFilter: lastFilterFromStore } = useSelector(
    (state) => state.files,
  );
  const dispatch = useDispatch();
  const [pageNumber, setPageNumber] = useState(1);
  const [isFetching, setIsFetching] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const observer = useRef();
  const defaultFileType = localStorage.getItem("agents_field") || "sell";

  // Determine if a user-defined filter is currently active
  const isFilterActive = useMemo(() => {
    // lastFilterFromStore is null when cleared, and an object when set.
    // So, its truthiness directly indicates if a filter is active.
    return !!lastFilterFromStore;
  }, [lastFilterFromStore]);

  const getFiles = useCallback(
    async (filterParams, pageToFetch, isNewFilter = false) => {
      //TODO: refactor this code for a better pagination
      setIsFetching(true);
      try {
        const response = await api.get(`/listing/?page=${pageToFetch}`, {
          params: filterParams,
        });
        const validResults = response.data.results.filter(
          (item) => item && typeof item === "object" && item.id,
        );

        if (isNewFilter) {
          dispatch(setFiles(validResults));
          setPageNumber(1);
        } else {
          dispatch(addFiles(validResults));
          setPageNumber((prev) => prev + 1);
        }
        setHasMore(response.data.next !== null);
      } catch (error) {
        console.error("Error fetching files:", error);
        setHasMore(false);
      } finally {
        setIsFetching(false);
        if (isNewFilter) setInitialLoad(false);
      }
    },
    [dispatch],
  );

  useEffect(() => {
    const effectiveFilterParams = lastFilterFromStore || {
      status: "ACTIVE",
      file_type: defaultFileType,
    };
    if (!isFetching) {
      // Prevent re-fetch if already fetching (e.g. from infinite scroll)
      getFiles(effectiveFilterParams, 1, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastFilterFromStore, defaultFileType]); // getFiles is stable

  const lastFileElementRef = useCallback(
    (node) => {
      if (isFetching || initialLoad || !hasMore) {
        if (observer.current) observer.current.disconnect();
        return;
      }
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && !isFetching && hasMore) {
            const currentFilterForScroll = lastFilterFromStore || {
              status: "ACTIVE",
              file_type: defaultFileType,
            };
            getFiles(currentFilterForScroll, pageNumber + 1, false);
          }
        },
        {
          threshold: 0.1,
          rootMargin: "200px",
        },
      );
      if (node) observer.current.observe(node);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [
      isFetching,
      hasMore,
      pageNumber,
      lastFilterFromStore,
      defaultFileType,
      initialLoad,
    ],
  ); // getFiles is stable

  const openFilterModal = () => setIsFilterModalOpen(true);
  const closeFilterModal = () => setIsFilterModalOpen(false);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        closeFilterModal();
      }
    };
    if (isFilterModalOpen) {
      document.addEventListener("keydown", handleEscape);
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isFilterModalOpen]);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-md sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <FiHome className="h-7 w-7 text-indigo-600 mr-2 rtl:mr-0 rtl:ml-2" />
            <h1 className="text-xl sm:text-2xl font-semibold text-indigo-700">
              لیست فایل‌ها
            </h1>
          </div>
          <button
            onClick={openFilterModal}
            className="relative p-2 rounded-md text-indigo-600 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label={isFilterActive ? "ویرایش فیلتر فعال" : "باز کردن فیلتر"}
            title={
              isFilterActive
                ? "فیلتر فعال است - کلیک برای ویرایش"
                : "باز کردن فیلتر"
            }
          >
            <FiFilter className="h-6 w-6" />
            {isFilterActive && (
              <span
                className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-red-500 ring-1 ring-white"
                aria-hidden="true" // Decorative, label provided by button
              >
                <span className="sr-only">فیلتر فعال است</span>{" "}
                {/* For screen readers if they pick this up separately */}
              </span>
            )}
          </button>
        </div>
      </header>

      {isFilterModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4"
          onClick={closeFilterModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="filter-dialog-title"
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <Filter onCloseDialog={closeFilterModal} />
          </div>
        </div>
      )}

      <main className="container mx-auto px-2 sm:px-4 py-6">
        {initialLoad && files.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <BeatLoader color="#4F46E5" loading={true} size={15} />
            <p className="mr-3 text-lg text-gray-600">
              درحال بارگذاری فایل‌ها...
            </p>
          </div>
        ) : files && files.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:gap-8">
            {files.map((file, index) => {
              if (!file || !file.id) {
                console.warn(
                  "Files.jsx: Attempting to render invalid file data in map:",
                  file,
                );
                return null;
              }
              if (files.length === index + 1) {
                return (
                  <div ref={lastFileElementRef} key={file.id}>
                    <FileCard file={file} />
                  </div>
                );
              } else {
                return <FileCard key={file.id} file={file} />;
              }
            })}
          </div>
        ) : (
          !isFetching &&
          !initialLoad && (
            <div className="text-center py-10">
              <FiHome className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">
                فایلی یافت نشد
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                با تغییر فیلترها مجددا تلاش کنید یا بعدا سر بزنید.
              </p>
            </div>
          )
        )}
        {isFetching && !initialLoad && (
          <div className="flex justify-center py-8">
            <BeatLoader color="#4F46E5" loading={true} size={10} />
            <p className="mr-2 text-sm text-gray-500">
              بارگذاری موارد بیشتر...
            </p>
          </div>
        )}
        {!isFetching && !hasMore && files.length > 0 && (
          <p className="text-center text-gray-500 py-6 text-sm">
            به انتهای لیست رسیده‌اید.
          </p>
        )}
      </main>
      <ScrollButton />
    </div>
  );
};

export default Files;
