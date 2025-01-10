import { useState } from "react";
import FloatLabel from "../common/input";
import { api } from "../common/api";
import { setFlashMessage } from "../common/flashSlice";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import PasswordInput from "../common/password_input";

const SignUp = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState(null);
  const [password1, setPassword1] = useState(null);
  const [password2, setPassword2] = useState(null);

  let credintials = {
    username: phone,
    password: password1 === password2 ? password1 : null,
  };

  const register = (credentials) => {
    api
      .post("agents/signup/", credentials)
      .then((response) => {
        console.log(response.data);
        window.localStorage.setItem("user", response.data.username);
        navigate("/agents/login/");
      })
      .then((error) => console.log(error));
  };
  return (
    <div className="flex h-screen w-screen">
      <form
        id="login"
        className="flex flex-col m-auto gap-5 rounded-lg shadow-2xl  border p-5 bg-white self-center items-center justify-center "
        onSubmit={(e) => {
          e.preventDefault();
          register(credintials);
        }}
      >
        <h3 className="text-lg text-black">ثبت نام</h3>
        <FloatLabel
          label={"شماره تلفن"}
          name={"username"}
          setter={setPhone}
          type={"numbers"}
          isRequired={true}
          dir={"ltr"}
        />
        <PasswordInput
          label={"رمز عبور"}
          name="password"
          setter={setPassword1}
          hasShowPassword={true}
        />

        <PasswordInput
          label={"رمز عبور"}
          name="password"
          setter={setPassword2}
          hasShowPassword={true}
        />
        {password1 === password2 ? (
          <button
            className="w-full rounded-lg text-lg bg-blue-300 p-1"
            id="submit"
            type="submit"
            disabled={password1 !== password2}
          >
            ثبت نام
          </button>
        ) : (
          <button
            className="w-full rounded-lg text-lg bg-blue-300 p-1 opacity-50 cursor-not-allowed"
            id="submit"
            type="submit"
            disabled
          >
            ثبت نام
          </button>
        )}
      </form>
    </div>
  );
};

export default SignUp;
