import { useState, useEffect, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import api from "../common/api";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import Select from 'react-select';
import FloatLabel from "../common/input";
import { setFlashMessage } from "../common/flashSlice";


const NewCallLog = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { fileType, id } = useParams();
  const [customerId, setCustomerId] = useState(null)
  const [customersOptions, setCustomersOptions] = useState(null) // customres list to pick one
  const [description, setDescription] = useState(null)
  const [subject, setSubject] = useState(null)
  const user = localStorage.getItem("user");

  let callLogEntry = {
    username: user,
    file: id,
    customer: customerId,
    description: description,
    subject: subject
  }
  const handleSubmit = (event, entry) => {
    event.preventDefault();
    console.log(callLogEntry)
    api
      .post(`logs/${fileType}-call/`, entry)
      .then(() => {

        dispatch(
          setFlashMessage({
            type: "SUCCESS",
            message: "یک لاگ تماس اضافه شد",
          }))
        navigate("/")
      }).catch(e => console.error(e)
      )

  }

  useEffect(() => {
    api
      .get("listing/customers/", {
        params: {
          "status": "ACTIVE",
          customer_type: (fileType === "sell" ? "buy" : "rent"),
          page_size: 99999, // gets all the customers
        }
      })
      .then(response => {

        let options = []
        response.data.results.map((customer) => {
          options.push({ value: customer.customer_name, label: customer.customer_name, id: customer.id })
        })
        console.log(options)

        setCustomersOptions(options)
      })
      .catch(error => console.log(error))
  }, [fileType, id])
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

              <Dialog.Title className=""> لاگ تماس</Dialog.Title>
              <div className="block border shadow-lg rounded-xl bg-white mx-4 px-4 py-2 my-2">
                <form
                  onSubmit={e => handleSubmit(e, callLogEntry)}
                  className="flex flex-col max-w-md gap-5 text-sm md:text-base"
                >

                  <div className="flex justify-start gap-4">

                    <p className="flex justify-center items-center">مشتری ها:</p>
                    <Select onChange={customer => setCustomerId(customer.id)}
                      options={customersOptions}
                      isClearable
                      isRtl
                      isSearchable />
                  </div>
                  <div className="flex justify-start gap-4">

                    <p className="flex justify-center items-center">موضوع:</p>
                    <Select onChange={subject => setSubject(subject.value)}
                      options={[
                        { value: "M", label: "معرفی" },
                        { value: "P", label: "پیگیری" }
                      ]}
                      isRtl

                    />
                  </div>

                  <FloatLabel
                    type="text"
                    name={"description"}
                    label={"توضیحات"}
                    setter={setDescription}
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

export default NewCallLog
