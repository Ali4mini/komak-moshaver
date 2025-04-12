import { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import FloatLabel from './input';
import { useParams } from "react-router-dom"
import { api } from "../common/api";
import { useDispatch } from 'react-redux';
import { setFlashMessage } from "../common/flashSlice";

const AddressSMS = ({ isOpen, setIsOpen }) => {
  const { fileType, id } = useParams();
  const [phoneNumber, setPhoneNumber] = useState('');
  const dispatch = useDispatch()

  const closeModal = () => setIsOpen(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (phoneNumber.length < 11) {
      alert("شماره تلفن باید ۱۱ رقم باشد");
      return;
    }
    api.post(`file/${fileType}/${id}/send/`, { "phone_numbers": phoneNumber }).then(res => {
      if (res.status === 200) {
        dispatch(
          setFlashMessage({
            type: "SUCCESS",
            message: "پیام وارد صف شد"
          })
        )
      }
    }).catch(error => {
      console.log(error)
    })

    closeModal();
  };

  return (

    <>
      <Transition
        show={isOpen}
        enter="transition duration-100 ease-out"
        enterFrom="transform scale-95 opacity-0"
        enterTo="transform scale-100 opacity-100"
        leave="transition duration-75 ease-out"
        leaveFrom="transform scale-100 opacity-100"
        leaveTo="transform scale-95 opacity-0"
        as={Fragment}
      >
        <Dialog
          open={isOpen}
          onClose={() => setIsOpen(false)}
          className="relative z-50"
        >
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

          <div className="fixed inset-0 flex items-center justigy-center">
            <Dialog.Panel className="flex flex-col gap-2 mx-auto w-3/4 px-5 py-2 max-w-md rounded-lg bg-white">

              <Dialog.Title className="">sms</Dialog.Title>
              <div className="block border shadow-lg rounded-xl bg-white mx-4 px-4 py-2 my-2">
                <form
                  onSubmit={e => handleSubmit(e)}
                  className="flex flex-col max-w-md gap-5 text-sm md:text-base"
                >


                  <FloatLabel
                    type="text"
                    name={"description"}
                    label={"شماره همراه"}
                    setter={setPhoneNumber}
                    value={phoneNumber}
                    isRequired={false}
                  />

                  <button
                    type="submit"
                    className="basis-full rounded-lg bg-blue-300 hover:bg-blue-400 py-1.5 border w-full bottom-0"
                  >
                    ثبت
                  </button>
                </form>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default AddressSMS;



