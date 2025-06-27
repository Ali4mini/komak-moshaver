// Search.jsx
import { Fragment, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { api } from "../common/api";
import { useNavigate } from "react-router-dom";
import PropTypes from 'prop-types';
import { MagnifyingGlassIcon, XMarkIcon, DocumentTextIcon, UserIcon, UsersIcon, CheckCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

// TODO: fix customer only search with last_name and phone_number
// --- SearchItem Component ---
const SearchItem = ({ name, secondaryText, id, itemType, typeSpecific, hasNotified, onClick }) => {
  let IconComponent;
  switch (itemType) {
    case 'file': IconComponent = DocumentTextIcon; break;
    case 'customer_preference': IconComponent = UserIcon; break;
    case 'person': IconComponent = UsersIcon; break;
    case 'person_with_files_context': IconComponent = UsersIcon; break;
    case 'person_with_customer_preference_context': IconComponent = UsersIcon; break;
    default: IconComponent = DocumentTextIcon;
  }

  return (
    <div
      className={`group flex items-center justify-between p-3 rounded-md transition-all duration-150 ease-in-out cursor-pointer ${hasNotified ? 'bg-gray-100' : 'hover:bg-indigo-50'}`}
      onClick={() => !hasNotified && onClick()}
      role="button" tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') !hasNotified && onClick() }}
    >
      <div className="flex items-center space-x-3 rtl:space-x-reverse min-w-0">
        <IconComponent className={`w-6 h-6 flex-shrink-0 ${hasNotified ? 'text-gray-400' : 'text-indigo-500'}`} />
        <div className={`flex-1 min-w-0 ${hasNotified ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
          <h3 className="text-sm font-semibold truncate">{name || 'نامشخص'}</h3>
          {secondaryText && <p className="text-xs text-gray-500 truncate">{secondaryText}</p>}
        </div>
      </div>
      {hasNotified && (
        <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0" title="اطلاع داده شده" />
      )}
    </div>
  );
};

SearchItem.propTypes = {
  name: PropTypes.string,
  secondaryText: PropTypes.string,
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  itemType: PropTypes.oneOf(['file', 'customer_preference', 'person', 'person_with_files_context', 'person_with_customer_preference_context']).isRequired,
  typeSpecific: PropTypes.string,
  hasNotified: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
};
SearchItem.defaultProps = { hasNotified: false, typeSpecific: '' };


// --- Main Search Component ---
const Search = ({ isOpen, setIsOpen }) => {
  const [searchParams, setSearchParams] = useState({
    subject: "file",
    field: "id",
    key: "",
  });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let defaultField = "id";
    if (searchParams.subject === "person") {
      defaultField = "name";
    } else if (searchParams.subject === "file") {
      defaultField = "id";
    } else if (searchParams.subject === "customer_preference") {
      defaultField = "id";
    }

    setSearchParams(prev => ({
      ...prev,
      field: defaultField,
      key: ""
    }));
    setResults([]);
    setHasSearched(false);
  }, [searchParams.subject]);

  useEffect(() => {
    setResults([]);
    setHasSearched(false);
  }, [searchParams.field]);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({ ...prev, [name]: value }));
  };

  const performSearch = async (e) => {
    if (e) e.preventDefault();
    const trimmedKey = searchParams.key.trim();
    if (!trimmedKey) {
      setResults([]); setHasSearched(true); return;
    }
    setLoading(true); setHasSearched(true); setResults([]);

    let endpoint = "";
    let apiParams = {};
    let currentItemTypeForResults = searchParams.subject;

    if (searchParams.subject === "file") {
      if (searchParams.field === "id") {
        endpoint = "/listing/";
        apiParams = { id: trimmedKey };
        currentItemTypeForResults = 'file';
      } else if (searchParams.field === "name") {
        endpoint = "common/persons/";
        apiParams = { last_name: trimmedKey };
        currentItemTypeForResults = 'person_with_files_context';
      } else {
        endpoint = "/listing/";
        apiParams = { [searchParams.field]: trimmedKey };
        currentItemTypeForResults = 'file';
      }
    } else if (searchParams.subject === "customer_preference") {
      endpoint = "/listing/customers/";
      if (searchParams.field === "id") {
        apiParams = { id: trimmedKey };
      } else if (searchParams.field === "name") {
        apiParams = { customer_name__icontains: trimmedKey };
      } else {
         apiParams = { [searchParams.field]: trimmedKey };
      }
      currentItemTypeForResults = 'customer_preference';
    } else if (searchParams.subject === "person") {
      endpoint = "common/persons/";
      if (searchParams.field === "id") {
        apiParams = { id: trimmedKey };
      } else if (searchParams.field === "name") {
        apiParams = { last_name__contains: trimmedKey };
      } else if (searchParams.field === "phone_number") {
        apiParams = { phone_number__contains: trimmedKey };
      }
      currentItemTypeForResults = 'person';
    } else {
      setLoading(false); return;
    }

    try {
      const response = await api.get(endpoint, { params: apiParams });
      let processedData = [];
      if (response.data && Array.isArray(response.data.results)) {
        processedData = response.data.results;
      } else if (Array.isArray(response.data)) {
        processedData = response.data;
      }

      const resultsWithContext = processedData.map(item => ({ ...item, _searchResultItemType: currentItemTypeForResults }));
      setResults(resultsWithContext);

    } catch (error) {
      console.error("Search API error:", error.response?.data || error.message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleItemClick = (item) => {
    const itemType = item._searchResultItemType;
    const id = String(item.id);
    let path = "";

    switch (itemType) {
      case 'file':
        path = `/file/${item.file_type}/${id}`;
        break;
      case 'customer_preference':
        path = `/customer/${item.customer_type}/${id}`;
        break;
      case 'person':
        path = `/persons/${id}`;
        break;
      case 'person_with_files_context':
        path = `/persons/${id}?context=files`;
        break;
      case 'person_with_customer_preference_context':
        path = `/persons/${id}?context=customer_preferences`;
        break;
      default:
        setIsOpen(false); return;
    }
    navigate(path);
    setIsOpen(false);
  };

  // Removed dark theme classes from common styles
  const commonSelectClasses = "w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 shadow-sm";
  const commonInputClasses = "w-full bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5 shadow-sm";

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={() => setIsOpen(false)} className="relative z-50">
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
        </Transition.Child>
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
            <Dialog.Panel className="flex flex-col w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-200">
                <Dialog.Title className="text-lg font-semibold text-gray-900 flex items-center">
                  <MagnifyingGlassIcon className="w-6 h-6 me-2 rtl:ms-2 text-indigo-600" />
                  جستجوی پیشرفته
                </Dialog.Title>
                <button onClick={() => setIsOpen(false)} className="p-1 rounded-full text-gray-400 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500" aria-label="بستن جستجو">
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={performSearch} className="p-4 sm:p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="subject" className="block mb-1.5 text-sm font-medium text-gray-700">جستجو در:</label>
                    <select name="subject" id="subject" value={searchParams.subject} onChange={handleInputChange} className={commonSelectClasses}>
                      <option value="file">فایل‌ها</option>
                      <option value="customer_preference">متقاضیان (جستجوها)</option>
                      <option value="person">اشخاص (کلی)</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="field" className="block mb-1.5 text-sm font-medium text-gray-700">بر اساس:</label>
                    <select name="field" id="field" value={searchParams.field} onChange={handleInputChange} className={commonSelectClasses}>
                      <option value="id">کد</option>
                      {searchParams.subject === "person" ? (
                        <>
                          <option value="name">نام شخص</option>
                          <option value="phone_number">شماره تلفن</option>
                        </>
                      ) : searchParams.subject === "file" ? (
                        <option value="name">نام مالک</option>
                      ) : ( // customer_preference
                        <option value="name">نام متقاضی</option>
                      )}
                    </select>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-end gap-3">
                  <div className="flex-grow">
                    <label htmlFor="key" className="block mb-1.5 text-sm font-medium text-gray-700">عبارت جستجو:</label>
                    <input
                      type={
                        searchParams.field === "id" ? "number" :
                        (searchParams.subject === "person" && searchParams.field === "phone_number") ? "tel" :
                        "text"
                      }
                      name="key" id="key" value={searchParams.key} onChange={handleInputChange} className={commonInputClasses}
                      placeholder={
                        searchParams.field === "id" ? "کد..." :
                        (searchParams.subject === "person" && searchParams.field === "phone_number") ? "شماره دقیق تلفن..." : "نام..."
                      }
                      required
                    />
                  </div>
                  <button type="submit" disabled={loading} className="w-full sm:w-auto flex items-center justify-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-150 ease-in-out disabled:opacity-70 disabled:cursor-not-allowed">
                    {loading ? <ArrowPathIcon className="w-5 h-5 animate-spin me-2 rtl:ms-2" /> : <MagnifyingGlassIcon className="w-5 h-5 me-2 rtl:ms-2" />}
                    {loading ? "در حال جستجو..." : "جستجو"}
                  </button>
                </div>
              </form>
              <div className={`px-1 sm:px-2 pb-1 sm:pb-2 ${loading || results.length > 0 || hasSearched ? 'border-t border-gray-200' : ''}`}>
                <div id="results-container" className="h-[250px] sm:h-[300px] overflow-y-auto custom-scrollbar p-2 space-y-1">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                      <ArrowPathIcon className="w-8 h-8 animate-spin mb-2" />
                      <p>در حال بارگذاری نتایج...</p>
                    </div>
                  ) : results.length > 0 ? (
                    results.map(item => {
                      let itemProps = {};
                      const resultItemType = item._searchResultItemType;

                      if (resultItemType === 'file') {
                        itemProps = { itemType: 'file', name: item.owner_name || `فایل ${item.file_type === "sell" ? "فروش": "اجاره"}-${item.id}`, secondaryText: item.address || `کد فایل: ${item.id}`, typeSpecific: item.file_type, };
                      } else if (resultItemType === 'customer_preference') {
                        itemProps = { itemType: 'customer_preference', name: item.customer_name || `متقاضی ${item.id}`, secondaryText: item.customer_phone || `کد متقاضی: ${item.id}`, typeSpecific: item.customer_type, };
                      } else if (resultItemType === 'person' || resultItemType === 'person_with_files_context' || resultItemType === 'person_with_customer_preference_context') {
                        itemProps = { itemType: resultItemType, name: item.full_name || `${item.first_name || ''} ${item.last_name || ''}`.trim() || `شخص ${item.id}`, secondaryText: item.phone_number || `کد شخص: ${item.id}`, typeSpecific: resultItemType === 'person_with_files_context' ? 'فایل‌های این شخص' : (resultItemType === 'person_with_customer_preference_context' ? 'تقاضاهای این شخص' : (item.id || 'شخص')), };
                      }
                      return ( <SearchItem key={`${resultItemType}_${item.id}`} id={String(item.id)} {...itemProps} onClick={() => handleItemClick(item)} /> );
                    })
                  ) : hasSearched ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                      <MagnifyingGlassIcon className="w-12 h-12 mb-3 opacity-50" />
                      <p className="text-center">نتیجه‌ای یافت نشد.</p>
                      <p className="text-xs text-center mt-1">معیارهای جستجو را تغییر دهید.</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                      <MagnifyingGlassIcon className="w-12 h-12 mb-3 opacity-30" />
                      <p className="text-center">برای مشاهده نتایج، جستجو کنید.</p>
                    </div>
                  )}
                </div>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};
Search.propTypes = { isOpen: PropTypes.bool.isRequired, setIsOpen: PropTypes.func.isRequired };
export default Search;
