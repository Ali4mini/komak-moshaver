import { useEffect, useState } from "react";
import FloatLabel from "../common/input";
import api from "../common/api";
import { setFlashMessage } from "../common/flashSlice";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import PasswordInput from "../common/password_input";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const loginUser = (credentials) => {
    api
      .post("token/", credentials)
      .then((response) => {
        localStorage.setItem("access_token", response.data.access);
        localStorage.setItem("refresh_token", response.data.refresh);
        localStorage.setItem("user", credentials.username);

        api.get(`agents/profile/${credentials.username}/`).then((response) => {
          switch (response.status) {
            case 200:
              localStorage.setItem("agents_field", response.data.field)
              navigate("/");
              break;
          }
        });
      })
      .catch((error) => {
        switch (error.response.status) {
          case 400:
            dispatch(
              setFlashMessage({
                type: "failure",
                message: "نام کاربری یا ورمز عبور اشتباه است",
              }),
            );
            break;

          default:
            console.log(error.response.status);
            break;
        }
      });
  };

  const [username, setUsername] = useState(null);
  const [password, setPassword] = useState(null);
  const credentials = {
    username: username,
    password: password,
  };
  return (
    <div className="flex h-screen w-screen">
      <form
        id="login"
        className="flex flex-col m-auto gap-5 rounded-lg shadow-2xl  border p-5 bg-white self-center items-center justify-center "
        onSubmit={(e) => {
          e.preventDefault();
          loginUser(credentials);
        }}
      >
        <h3 className="text-lg text-black">ورود مشاور</h3>
        <FloatLabel
          label={"نام کاربری"}
          name={"username"}
          setter={setUsername}
          type={"text"}
          isRequired={true}
          dir={"ltr"}
        />
        <PasswordInput
          label={"رمز عبور"}
          name="password"
          setter={setPassword}
          hasShowPassword={true}
        />
        <button
          className="w-full rounded-lg text-lg bg-blue-300 p-1"
          id="submit"
          type="submit"
        >
          ورود
        </button>
        <Link to={"/agents/signup/"}>ثبت نام</Link>
      </form>
    </div>
  );
};

export default Login;
