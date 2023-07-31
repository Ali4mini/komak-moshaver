const FloatLabel = ({label, name, type, innerRef, isRequired=false}) => {
    return (
      <div className="relative">
        <input
          type={type}
          className="peer w-full px-3 rounded-lg shadow border h-10 border-gray-300  placeholder-transparent
          focus:outline-none"
          name={name}
          id={name}
          placeholder={label}
          required={isRequired}
          
          />
        <label
          htmlFor={name}
          className="absolute text-gray-500 right-4 text-sm -top-3.5 px-2 bg-white transition-all
          peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-2 peer-placeholder-shown:bg-transparent
          peer-focus:text-gray-500 peer-focus:-top-3.5 peer-focus:bg-white peer-focus:px-2"
        >
          {label}
        </label>
      </div>
    );
  };
  
  export default FloatLabel;