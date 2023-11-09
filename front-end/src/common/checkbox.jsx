const Checkbox = ({
  label,
  name,
  setter,
  isChecked = false,
  isRequired = false,
}) => {
  return (
    <div className="">
      <input
        id={name}
        type="checkbox"
        name={name}
        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded "
        onChange={() => setter((prevState) => (prevState ? null : true))}
        required={isRequired}
        defaultChecked={isChecked}
      />
      <label htmlFor={name} className="mr-2 text-sm font-medium text-gray-900 ">
        {label}
      </label>
    </div>
  );
};

export default Checkbox;
