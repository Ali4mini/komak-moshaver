import { useState } from "react";
import { api } from "../common/api";
import { useNavigate } from "react-router-dom";
import FloatLabel from "../common/input";

const Profile = () => {
  const navigate = useNavigate();

  const [phoneNumber, setPhoneNubmer] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const data = {
    first_name: firstName,
    last_name: lastName,
    phone_number: phoneNumber,
    user: window.localStorage.getItem("user"),
  };
  const handleSubmit = (data) => {
    api
      .post("agents/new/profile/", data)
      .then((response) => {
        console.log(response.status);
        navigate("/");
      })
      .catch((error) => console.log(error));
  };

  return (
    <div className="flex h-screen w-screen">
      <form
        id="login"
        className="flex flex-col m-auto gap-5 rounded-lg shadow-2xl  border p-5 bg-white self-center items-center justify-center "
        onSubmit={(e) => {
          e.preventDefault();

          handleSubmit(data);
        }}
      >
        <h3 className="text-lg text-black">ثبت نام</h3>
        <FloatLabel
          label={"first_name"}
          name={"first_name"}
          setter={setFirstName}
          type={"string"}
          isRequired={true}
          dir={"ltr"}
        />
        <FloatLabel
          label={"last_name"}
          name={"last_name"}
          setter={setLastName}
          type={"string"}
          isRequired={true}
          dir={"ltr"}
        />
        <FloatLabel
          label={"phone_number"}
          name={"phone_number"}
          setter={setPhoneNubmer}
          type={"string"}
          isRequired={true}
          dir={"ltr"}
        />
        <button
          className="w-full rounded-lg text-lg bg-blue-300 p-1 "
          id="submit"
          type="submit"
        >
          ورود
        </button>
      </form>
    </div>
  );
};

export default Profile;
