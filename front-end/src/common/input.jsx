import { useRef } from "react";
import PropTypes from "prop-types";

const FloatLabel = ({
  label,
  name,
  type,
  setter,
  defValue = "", // Default value for defValue
  value,
  dir,
  isRequired = false,
  isDisabled = false,
  maxChars = Infinity, // Default to Infinity if not provided
}) => {
  const inputRef = useRef();

  const handleChange = (e) => {
    const newValue = e.target.value;

    setter(newValue); // Update state if validation passes
  };

  return (
    <div className="relative">
      <input
        type={type}
        className="peer w-full px-3 rounded-lg shadow border h-10 border-gray-300 placeholder-transparent focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
        name={name}
        id={name}
        placeholder={label}
        required={isRequired}
        defaultValue={defValue}
        value={value}
        onChange={handleChange} // Use the new handleChange function
        dir={dir}
        ref={inputRef}
	disabled={isDisabled}
        maxLength={maxChars} // Set maxLength attribute
      />

      <label
        htmlFor={name}
        className="absolute text-gray-500 right-4 text-sm -top-3.5 px-2 bg-white transition-all peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-2 peer-placeholder-shown:bg-transparent peer-focus:text-gray-500 peer-focus:-top-3.5 peer-focus:bg-white peer-focus:px-2 "
      >
        {label}
      </label>
    </div>
  );
};

// Prop validation
FloatLabel.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  setter: PropTypes.func.isRequired,
  defValue: PropTypes.string,
  value: PropTypes.string.isRequired,
  dir: PropTypes.string,
  isRequired: PropTypes.bool,
  maxChars: PropTypes.number,
  minChars: PropTypes.number,
};

export default FloatLabel;
