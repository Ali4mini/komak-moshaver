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

const TOUR_TYPE_OPTIONS = [
  { value: "H", label: "همراه (بازدید به همراه مشتری)" },
  { value: "P", label: "پس فایل (بازدید پس از معرفی)" },
  { value: "I", label: "مراجعه اولیه مشتری" },
];

const NewTourLog = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { fileType, id: fileId } = useParams();

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customersOptions, setCustomersOptions] = useState([]);
  const [description, setDescription] = useState("");
  const [selectedTourType, setSelectedTourType] = useState(null);
  
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const user = localStorage.getItem("user");

  useEffect(() => {
    if (!isOpen) {
      setSelectedCustomer(null);
      setDescription("");
      setSelectedTourType(null);
      setFetchError(null);
      setCustomersOptions([]);
      return;
    }

    setIsLoadingCustomers(true);
    setFetchError(null);
    setCustomersOptions([]);

    api.get(`file/${fileType}/${fileId}/related_customers/`)
      .then(async (response) => { // Make this async to use await for Promise.all
        if (response.data && Array.isArray(response.data)) {
          if (response.data.length === 0) {
            setCustomersOptions([]);
            setIsLoadingCustomers(false);
            return;
          }

          // Create an array of promises, each fetching a person's details
          const customerDetailPromises = response.data.map(relatedCustomer => {
            // 'relatedCustomer.customer' is the ID of the Person
            // 'relatedCustomer.id' is the ID of the relationship/request itself
            return api.get(`common/persons/${relatedCustomer.customer}/`)
              .then(personResponse => ({
                relationshipId: relatedCustomer.id, // This is the ID for the TourLog's customer field
                personDetails: personResponse.data,
                // You might want to include other fields from relatedCustomer if needed for the label
                // e.g., requestType: relatedCustomer.request_type 
              }))
              .catch(personError => {
                console.error(`Failed to fetch details for person ID ${relatedCustomer.customer}:`, personError);
                // Return a placeholder or null if a single person fetch fails,
                // so Promise.all doesn't reject entirely if one fails (optional handling)
                return { 
                  relationshipId: relatedCustomer.id, 
                  personDetails: null, // Or some default error object
                  error: true 
                }; 
              });
          });

          // Wait for all person detail fetches to complete
          const resolvedCustomerDetails = await Promise.all(customerDetailPromises);

          const formattedOptions = resolvedCustomerDetails
            .filter(detail => detail && detail.personDetails) // Filter out any that failed and returned null personDetails
            .map(detail => {
              const person = detail.personDetails;
              // Assuming person model has 'first_name', 'last_name', 'phone_number'
              // Adjust according to your Person model's fields
              const customerName = `${person.first_name || ''} ${person.last_name || ''}`.trim() || 'نام نامشخص';
              // const phoneNumber = person.phone_number || 'شماره نامشخص';
              
              return {
                value: detail.relationshipId, // Use the ID from related_customers item
                label: `${customerName}`,
              };
            });
            
          setCustomersOptions(formattedOptions);

        } else {
          console.warn("Received unexpected data format for related customers:", response.data);
          setCustomersOptions([]);
          setFetchError("فرمت پاسخ مشتریان نامعتبر است.");
        }
      })
      .catch((error) => {
        console.error("Failed to fetch related customers list:", error);
        setFetchError("خطا در بارگذاری لیست مشتریان.");
      })
      .finally(() => {
        setIsLoadingCustomers(false);
      });
  }, [isOpen, fileType, fileId, dispatch]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedCustomer || !selectedTourType) {
      dispatch(
        setFlashMessage({
          type: "WARNING",
          message: "لطفا مشتری و نوع بازدید را انتخاب کنید.",
        })
      );
      return;
    }

    setIsSubmitting(true);

    const tourLogEntry = {
      file: fileId,
      customer: selectedCustomer.value, // This should be the relationshipId
      description: description.trim(),
      tour_type: selectedTourType.value,
      username: user,
    };

    try {
      await api.post(`logs/${fileType}-tour/`, tourLogEntry);
      dispatch(
        setFlashMessage({
          type: "SUCCESS",
          message: "لاگ بازدید با موفقیت اضافه شد.",
        })
      );
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to submit tour log:", error);
      const errorMessage = error.response?.data?.detail || (error.response?.data ? JSON.stringify(error.response.data) : "خطا در ثبت لاگ بازدید.");
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
      zIndex: 51, 
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-xl bg-white dark:bg-slate-800 p-6 text-left align-middle shadow-2xl transition-all">
                <div className="flex justify-between items-center">
                  <Dialog.Title
                    as="h3"
                    className="text-xl font-semibold leading-6 text-gray-900 dark:text-white"
                  >
                    ثبت لاگ بازدید جدید
                  </Dialog.Title>
                  <button
                    type="button"
                    onClick={() => !isSubmitting && setIsOpen(false)}
                    className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
                    disabled={isSubmitting}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="mt-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label htmlFor="customer-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        مشتری <span className="text-red-500">*</span>
                      </label>
                      <Select
                        inputId="customer-select"
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
                        noOptionsMessage={() => isLoadingCustomers ? "در حال بارگذاری..." : (fetchError || (customersOptions.length === 0 && !isLoadingCustomers ? "مشتری مرتبطی برای این فایل یافت نشد." : "مشتری‌ای یافت نشد"))}
                      />
                       {fetchError && !isLoadingCustomers && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{fetchError}</p>}
                    </div>

                    <div>
                      <label htmlFor="tour-type-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        نوع بازدید <span className="text-red-500">*</span>
                      </label>
                      <Select
                        inputId="tour-type-select"
                        options={TOUR_TYPE_OPTIONS}
                        value={selectedTourType}
                        onChange={setSelectedTourType}
                        placeholder="انتخاب نوع بازدید..."
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
                        disabled={isSubmitting || isLoadingCustomers || !selectedCustomer || !selectedTourType}
                        className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed dark:disabled:bg-slate-600"
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

export default NewTourLog;
