import { useEffect, useState } from "react";
import FloatLabel from "../common/input";
import api from "../common/api";
import { setFlashMessage } from "../common/flashSlice";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import PasswordInput from "../common/password_input";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // redirect if user_id is in localstorage
  useEffect(() => {
    if (localStorage.getItem("user_id")) {
      navigate("/", { replace: true });
    }
  }, []);

  const getProfile = (credentials) => {
    api.get(`agents/profile/${credentials.username}/`).then((response) => {
      localStorage.setItem("agents_field", response.data.field);
      localStorage.setItem("user_id", response.data.user);
      switch (response.status) {
        case 200:
          navigate("/", { replace: true });
          break;

        default:
          break;
      }
    });
  };
  const loginUser = (credentials) => {
    api
      .post("token/", credentials)
      .then((response) => {
        localStorage.setItem("access_token", response.data.access);
        localStorage.setItem("refresh_token", response.data.refresh);
        switch (response.status) {
          case 200:
            getProfile(credentials);
            break;

          default:
            console.log(response.status);
            break;
        }
      })
      .catch((error) => {
        switch (error.response.status) {
          case 200:
            getProfile(credentials);
            break;

          case 400:
            dispatch(
              setFlashMessage({
                type: "failure",
                message: "نام کاربری یا ورمز عبور اشتباه است",
              })
            );
            break;

          default:
            console.log(response.status);
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
        {/* <FloatLabel
          label={"رمز ورود"}
          name={"password"}
          setter={setPassword}
          type={"password"}
          isRequired={true}
          dir={"ltr"}
        /> */}
        <PasswordInput
          label={"رمز عبور"}
          name="password"
          setter={setPassword}
        />
        <button
          className="w-full rounded-lg text-lg bg-blue-300 p-1"
          id="submit"
          type="submit"
        >
          ورود
        </button>
      </form>
    </div>
  );
};

export default Login;
