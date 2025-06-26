import { useState, useEffect, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { api } from "../common/api";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import Select from 'react-select';
import FloatLabel from "../common/input";
import { setFlashMessage } from "../common/flashSlice";
import { XMarkIcon } from '@heroicons/react/24/outline';
import { ArrowPathIcon } from '@heroicons/react/20/solid';

const CALL_SUBJECT_OPTIONS = [
  { value: "M", label: "معرفی فایل" },
  { value: "P", label: "پیگیری" },
  { value: "O", label: "سایر موارد" },
];

const customReactSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    borderColor: state.isFocused ? 'rgb(99 102 241)' : 'rgb(209 213 219)',
    '&:hover': {
      borderColor: 'rgb(129 140 248)',
    },
    boxShadow: state.isFocused ? '0 0 0 1px rgb(99 102 241)' : 'none',
    borderRadius: '0.5rem',
    minHeight: '42px',
    backgroundColor: 'white',
  }),
  menu: (provided) => ({
    ...provided,
    borderRadius: '0.5rem',
    zIndex: 51, // Ensure menu is above other elements in modal
  }),
  placeholder: (provided) => ({
      ...provided,
      color: 'rgb(107 114 128)',
  }),
  singleValue: (provided) => ({
      ...provided,
      color: 'rgb(17 24 39)',
  }),
};

const NewCallLog = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate(); // Not directly used in this component, but kept for consistency if needed elsewhere.
  const dispatch = useDispatch();
  const { fileType, id: fileId } = useParams();

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customersOptions, setCustomersOptions] = useState([]);
  const [description, setDescription] = useState("");
  const [selectedSubject, setSelectedSubject] = useState(null);
  
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const user = localStorage.getItem("user");

  useEffect(() => {
    if (!isOpen) {
      // Reset form when modal closes
      setSelectedCustomer(null);
      setSelectedSubject(null);
      setDescription("");
      setFetchError(null);
      setCustomersOptions([]);
      return;
    }

    setIsLoadingCustomers(true);
    setFetchError(null);
    setCustomersOptions([]); // Clear previous options

    // The API endpoint for related_customers is `file/{fileType}/{fileId}/related_customers/`
    // The response format from this endpoint is typically a list of objects,
    // where each object represents the relationship (e.g., BuyCustomer or RentCustomer instance)
    // and has a 'person' field pointing to the actual Person ID.
    api.get(`file/${fileType}/${fileId}/related_customers/`)
      .then(async (response) => { // Mark as async to use await for Promise.all
        // Assuming response.data is an array of relationship objects (e.g., BuyCustomer, RentCustomer)
        if (response.data && Array.isArray(response.data)) {
          const customersList = response.data; // Use response.data directly as it's the array

          if (customersList.length === 0) {
            setCustomersOptions([]);
            setIsLoadingCustomers(false);
            return;
          }

          // Create an array of promises, each fetching a person's details
          const customerDetailPromises = customersList.map(relatedCustomer => {
            // 'relatedCustomer.person' is the ID of the Person (from your backend's related_customers serializer)
            // 'relatedCustomer.id' is the ID of the BuyCustomer/RentCustomer record (the relationship ID)
            if (!relatedCustomer.customer) { // Handle cases where person ID might be missing
              console.warn("Related customer item missing person ID:", relatedCustomer);
              return Promise.resolve(null); // Resolve with null to filter out later
            }
            return api.get(`common/persons/${relatedCustomer.customer}/`)
              .then(personResponse => ({
                // This ID is the ID of the BuyCustomer or RentCustomer record, 
                // which is likely what your CallLog API expects for the 'customer' field
                relationshipId: relatedCustomer.id, 
                personDetails: personResponse.data,
              }))
              .catch(personError => {
                console.error(`Failed to fetch details for person ID ${relatedCustomer.customer}:`, personError);
                return null; // Resolve with null if person fetch fails
              });
          });

          // Wait for all person detail fetches to complete
          const resolvedCustomerDetails = await Promise.all(customerDetailPromises);

          const formattedOptions = resolvedCustomerDetails
            .filter(detail => detail && detail.personDetails) // Filter out any nulls (failed fetches or missing person IDs)
            .map(detail => {
              const person = detail.personDetails;
              // Adjust field names according to your Person model in the backend
              const customerName = `${person.first_name || ''} ${person.last_name || ''}`.trim() || 'نام نامشخص';
              // const phoneNumber = person.phone_number || 'شماره نامشخص';
              
              return {
                value: detail.relationshipId, // Use the relationship ID for the select option value
                label: `${customerName} `,
              };
            });
            
          setCustomersOptions(formattedOptions);

        } else {
          console.warn("Received unexpected data format from file/related_customers/:", response.data);
          setCustomersOptions([]);
          setFetchError("فرمت پاسخ لیست مشتریان نامعتبر است.");
        }
      })
      .catch((error) => {
        console.error("Failed to fetch customers list:", error);
        setFetchError("خطا در بارگذاری لیست مشتریان.");
        // Optional: Dispatch flash message here if you want it on fetch error
      })
      .finally(() => {
        setIsLoadingCustomers(false);
      });
  }, [isOpen, fileType, fileId, dispatch]); // fileId is now correctly part of dependencies since the API call uses it

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedCustomer || !selectedSubject) {
      dispatch(
          setFlashMessage({
            type: "WARNING",
            message: "لطفا مشتری و موضوع تماس را انتخاب کنید.",
          })
        );
      return;
    }

    setIsSubmitting(true);

    const callLogEntry = {
      file: fileId,
      customer: selectedCustomer.value, // This is the relationshipId (BuyCustomer/RentCustomer ID)
      description: description.trim(),
      subject: selectedSubject.value,
      username: user,
    };

    try {
      // The API endpoint for call logs is `logs/{fileType}-call/`
      await api.post(`logs/${fileType}-call/`, callLogEntry);
      dispatch(
        setFlashMessage({
          type: "SUCCESS",
          message: "لاگ تماس با موفقیت اضافه شد.",
        })
      );
      setIsOpen(false); // Close the modal on success
    } catch (error) {
      console.error("Failed to submit call log:", error);
      const errorMessage = error.response?.data?.detail || (error.response?.data ? JSON.stringify(error.response.data) : "خطا در ثبت لاگ تماس.");
      dispatch(
        setFlashMessage({
          type: "ERROR",
          message: errorMessage,
        })
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => !isSubmitting && setIsOpen(false)}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-xl bg-white  p-6 text-left align-middle shadow-2xl transition-all">
                <div className="flex justify-between items-center">
                  <Dialog.Title
                    as="h3"
                    className="text-xl font-semibold leading-6 text-gray-900 "
                  >
                    ثبت لاگ تماس جدید
                  </Dialog.Title>
                  <button
                    type="button"
                    onClick={() => !isSubmitting && setIsOpen(false)}
                    className="p-1 rounded-full text-gray-400 hover:text-gray-600  focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 "
                    disabled={isSubmitting}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="mt-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label htmlFor="customer-call-select" className="block text-sm font-medium text-gray-700  mb-1">
                        مشتری <span className="text-red-500">*</span>
                      </label>
                      <Select
                        inputId="customer-call-select"
                        options={customersOptions}
                        value={selectedCustomer}
                        onChange={setSelectedCustomer}
                        placeholder={isLoadingCustomers ? "در حال بارگذاری..." : "انتخاب مشتری..."}
                        isClearable
                        isRtl
                        isSearchable
                        isLoading={isLoadingCustomers}
                        isDisabled={isLoadingCustomers || isSubmitting}
                        styles={customReactSelectStyles}
                        // Consistent message for no options
                        noOptionsMessage={() => isLoadingCustomers ? "در حال بارگذاری..." : (fetchError || (customersOptions.length === 0 && !isLoadingCustomers ? "مشتری مرتبطی برای این فایل یافت نشد." : "مشتری‌ای یافت نشد"))}
                      />
                       {fetchError && !isLoadingCustomers && <p className="mt-1 text-xs text-red-600 ">{fetchError}</p>}
                    </div>

                    <div>
                      <label htmlFor="call-subject-select" className="block text-sm font-medium text-gray-700  mb-1">
                        موضوع تماس <span className="text-red-500">*</span>
                      </label>
                      <Select
                        inputId="call-subject-select"
                        options={CALL_SUBJECT_OPTIONS}
                        value={selectedSubject}
                        onChange={setSelectedSubject}
                        placeholder="انتخاب موضوع تماس..."
                        isRtl
                        isDisabled={isSubmitting}
                        styles={customReactSelectStyles}
                      />
                    </div>
                    
                    <FloatLabel
                      type="textarea"
                      name={"description"}
                      label={"توضیحات (اختیاری)"}
                      value={description}
                      setter={setDescription}
                      disabled={isSubmitting}
                      isRequired={false} 
                      rows={3}
                    />

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isSubmitting || isLoadingCustomers || !selectedCustomer || !selectedSubject}
                        className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed "
                      >
                        {isSubmitting ? (
                          <>
                            <ArrowPathIcon className="animate-spin h-5 w-5 mr-2 rtl:ml-2 rtl:mr-0" />
                            در حال ثبت...
                          </>
                        ) : (
                          "ثبت لاگ"
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default NewCallLog;
