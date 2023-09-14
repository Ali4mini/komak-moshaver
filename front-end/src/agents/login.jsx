import { useEffect, useState } from "react";
import FloatLabel from "../common/input";
import api from "../common/api";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  // redirect if user_id is in localstorage
  useEffect(() => {
    if (localStorage.getItem("user_id")) {
      navigate("/", { replace: true });
    }
  }, []);

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
            break;
        }
      })
      .catch((error) => console.log(error));
  };


  const getProfile = username => {
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
    })
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      loginUser(credentials);
    }
  }

  const [username, setUsername] = useState(null);
  const [password, setPassword] = useState(null);
  const credentials = {
    username: username,
    password: password,
  };
  return (
    <div className="flex h-screen w-screen">
      <div
        id="login"
        className="flex flex-col m-auto gap-5 rounded-lg shadow-2xl  border p-5 bg-white self-center items-center justify-center "
        onKeyDown={handleKeyDown}
      >
        <h3 className="text-lg text-black">ورود مشاور</h3>
        <FloatLabel
          label={"نام کاربری"}
          name={"username"}
          setter={setUsername}
          type={"text"}
          isRequired={true}
        />
        <FloatLabel
          label={"رمز ورود"}
          name={"password"}
          setter={setPassword}
          type={"password"}
          isRequired={true}
        />
        <button
          className="w-full rounded-lg text-lg bg-blue-300 p-1"
          id="submit"
          onClick={() => loginUser(credentials)}
        >
          ورود
        </button>
      </div>
    </div>
  );
};

export default Login;
