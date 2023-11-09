import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";

const MenuButton = ({ items, buttonText }) => {

  return (
    <Menu>
      <Menu.Button className="flex h-10 text-white bg-red-700 hover:bg-red-800 font-medium rounded-lg text-sm px-3 py-2.5 mr-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900">
        <div className="flex gap-3">
          {buttonText}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 5.25l-7.5 7.5-7.5-7.5m15 6l-7.5 7.5-7.5-7.5"
            />
          </svg>
        </div>
      </Menu.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items
          className={
            "absolute  mt-12  w-36 divide-y divide-gray-100 rounded-md bg-white shadow-xl border ring-1 ring-black/5 focus:outline-none"
          }
        >
          <div className="flex flex-col p-1 m-1 justify-center">
            {items.map((item) => (
              /* Use the `active` state to conditionally style the active item. */
              <Menu.Item key={item.key} as={Fragment}>
                {({ active }) => (
                  <button
                    onClick={item.handler}
                    className={`group flex text-xs md:text-sm rounded-md px-2 py-2 justify-start gap-2 ${
                      active ? "bg-gray-300" : "bg-white"
                    } ${item.style}`}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default MenuButton;
