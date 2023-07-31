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
        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded  transition duration-500 ease-in-out transform border-transparent  focus:border-blueGray-500 focus:bg-white focus:outline-none focus:shadow-outline focus:ring-2 ring-offset-current ring-offset-2 ring-gray-400"
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
