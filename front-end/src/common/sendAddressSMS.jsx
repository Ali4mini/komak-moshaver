import { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import FloatLabel from './input'; // Assuming this component is well-styled
import { useParams } from "react-router-dom";
import { api } from "../common/api"; // Ensure this path is correct
import { useDispatch } from 'react-redux';
import { setFlashMessage } from "../common/flashSlice"; // Ensure this path is correct

const AddressSMS = ({ isOpen, setIsOpen }) => {
  const { fileType, id } = useParams();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useDispatch();

  const closeModal = () => {
    if (isSubmitting) return; // Prevent closing while submitting
    setIsOpen(false);
    // Reset phone number when modal closes if desired
    // setPhoneNumber('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (phoneNumber.trim().length !== 11 || !/^\d{11}$/.test(phoneNumber.trim())) {
      // More specific validation
      dispatch(
        setFlashMessage({
          type: "ERROR",
          message: "شماره تلفن باید ۱۱ رقم و فقط شامل اعداد باشد.",
        })
      );
      // Or use alert: alert("شماره تلفن باید ۱۱ رقم و فقط شامل اعداد باشد.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post(`file/${fileType}/${id}/send/`, { "phone_numbers": phoneNumber.trim() });
      if (response.status === 200) {
        dispatch(
          setFlashMessage({
            type: "SUCCESS",
            message: "پیام با موفقیت به صف ارسال اضافه شد.",
          })
        );
        closeModal(); // Close modal on success
        setPhoneNumber(''); // Clear input on success
      } else {
        // Handle other success statuses if necessary, or non-200 success as an error
        dispatch(
          setFlashMessage({
            type: "ERROR",
            message: `خطا در ارسال پیام: ${response.statusText || 'خطای ناشناخته'}`,
          })
        );
      }
    } catch (error) {
      console.error("Error sending SMS:", error);
      const errorMessage = error.response?.data?.detail || error.message || "خطا در ارتباط با سرور.";
      dispatch(
        setFlashMessage({
          type: "ERROR",
          message: `ارسال پیام ناموفق بود: ${errorMessage}`,
        })
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Transition
      show={isOpen}
      as={Fragment}
      enter="transition ease-out duration-200"
      enterFrom="opacity-0 scale-95"
      enterTo="opacity-100 scale-100"
      leave="transition ease-in duration-150"
      leaveFrom="opacity-100 scale-100"
      leaveTo="opacity-0 scale-95"
    >
      <Dialog
        open={isOpen}
        onClose={closeModal}
        className="relative z-50"
      >
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/50" aria-hidden="true" />

        {/* Modal Content */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto w-full max-w-md transform overflow-hidden rounded-xl bg-white p-6 text-left align-middle shadow-2xl transition-all border border-gray-200">
            <Dialog.Title
              as="h3"
              className="text-xl font-semibold leading-6 text-gray-900 mb-6 text-center" // Or text-right for Persian
            >
              ارسال پیامک به آدرس
            </Dialog.Title>

            <form
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              <div>
                {/* Assuming FloatLabel handles its own styling well */}
                <FloatLabel
                  type="tel" // Use type="tel" for phone numbers
                  name="phoneNumber"
                  label="شماره همراه"
                  setter={setPhoneNumber}
                  value={phoneNumber}
                  isRequired={true} // Marked as required for clarity
                  maxLength={11} // HTML5 attribute for max length
                  pattern="\d{11}" // HTML5 pattern for 11 digits
                  inputMode="numeric" // Suggests numeric keyboard on mobile
                />
                {/* You could add inline validation messages here if FloatLabel supports it or if you add more state */}
              </div>

              <div className="mt-8 flex flex-col sm:flex-row-reverse sm:space-x-3 sm:space-x-reverse space-y-3 sm:space-y-0">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full inline-flex justify-center rounded-lg border border-transparent bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      در حال ارسال...
                    </>
                  ) : (
                    "ارسال پیامک"
                  )}
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={closeModal}
                  className="w-full inline-flex justify-center rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition-colors duration-200"
                >
                  لغو
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>
    </Transition>
  );
};

export default AddressSMS;
