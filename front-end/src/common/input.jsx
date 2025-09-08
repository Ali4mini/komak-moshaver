import { forwardRef } from "react";
import PropTypes from "prop-types";

// you have to use forwardRef to pass refs from the parent component
const FloatLabel = forwardRef(function FloatLable(props, ref) {
  const handleChange = (e) => {
    const newValue = e.target.value;

    props.setter(newValue); // Update state if validation passes
  };

  return (
    <div className="relative">
      <input
        type={props.type}
        className="peer w-full px-3 rounded-lg shadow border h-10 border-gray-300 placeholder-transparent focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
        name={props.name}
        id={props.name}
        placeholder={props.label}
        required={props.isRequired}
        defaultValue={props.defValue}
        value={props.value}
        onChange={handleChange}
        dir={props.dir}
        ref={ref}
        disabled={props.isDisabled}
        maxLength={props.maxChars}
      />

      <label
        htmlFor={props.name}
        className="absolute text-gray-500 right-4 text-sm -top-3.5 px-2 bg-white transition-all peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-2 peer-placeholder-shown:bg-transparent peer-focus:text-gray-500 peer-focus:-top-3.5 peer-focus:bg-white peer-focus:px-2 "
      >
        {props.label}
      </label>
    </div>
  );
});

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
  isDisabled: PropTypes.bool,
  maxChars: PropTypes.number,
  minChars: PropTypes.number,
};

export default FloatLabel;
