import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Select from 'react-select';
import FloatLabel from "../common/input";
import api from "../common/api";
import { useDispatch } from "react-redux";
import { setFlashMessage } from "../common/flashSlice";

const NewCallLog = () => {
  const { fileType, id } = useParams();
  const [customerId, setCustomerId] = useState(null)
  const [customersOptions, setCustomersOptions] = useState(null) // customres list to pick one
  const [description, setDescription] = useState(null)
  const [subject, setSubject] = useState(null)
  const user = localStorage.getItem("user");
  const dispatch = useDispatch()
  const navigate = useNavigate()

  let callLogEntry = {
    username: user,
    file: id,
    customer: customerId,
    description: description,
    subject: subject
  }

  const handleSubmit = async (event, entry) => {
    event.preventDefault();
    api
      .post(`logs/${fileType}-call/`, entry)
      .then((response) => {

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
      .get("listing/customers/", { params: { "status": "ACTIVE", customer_type: (fileType === "sell" ? "buy" : "rent") } })
      .then(response => {

        let options = []
        response.data.map((customer) => {
          options.push({ value: customer.customer_name, label: customer.customer_name, id: customer.id })
        })

        setCustomersOptions(options)
      })
      .catch(error => console.log(error))
  }, [fileType, id])

  if (customersOptions) {

    return (

      <div className="block border shadow-lg rounded-xl bg-white mx-4 px-4 py-2 my-2">
        <form
          onSubmit={e => handleSubmit(e, callLogEntry)}
          className="flex flex-col gap-5 text-sm md:text-base"
        >
          <Select onChange={customer => setCustomerId(customer.id)}
            options={customersOptions}
            isClearable
            isSearchable />

          <Select onChange={subject => setSubject(subject.value)}
            options={[
              { value: "M", label: "معرفی" },
              { value: "P", label: "پیگیری" }
            ]} isClearable
            isSearchable />

          <FloatLabel
            type="text"
            name={"description"}
            label={"description"}
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
    )
  }
}


export default NewCallLog
