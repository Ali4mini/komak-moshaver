import { useRef, useState } from "react";
import Checkbox from "./checkbox";
const PasswordInput = ({ label, name, setter }) => {
  const inputRef = useRef();
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div className="relative">
      <input
        type={showPassword ? "text" : "password"}
        className="peer w-full px-3 rounded-lg shadow border h-10 border-gray-300  placeholder-transparent
        focus:outline-none"
        name={name}
        id={name}
        placeholder={label}
        required={true}
        onChange={(e) => setter(e.target.value)}
        dir="ltr"
        ref={inputRef}
      />

      <label
        htmlFor={name}
        className="absolute text-gray-500 right-4 text-sm -top-3.5 px-2 bg-white transition-all
        peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-2 peer-placeholder-shown:bg-transparent
        peer-focus:text-gray-500 peer-focus:-top-3.5 peer-focus:bg-white peer-focus:px-2"
      >
        {label}
      </label>
      <Checkbox
        label={"show password"}
        name={"showPassword"}
        setter={setShowPassword}
      />
    </div>
  );
};

export default PasswordInput;
