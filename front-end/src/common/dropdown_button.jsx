import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { ChevronDownIcon } from "@heroicons/react/20/solid"; // Using a more standard chevron

const MenuButton = ({
  items,
  buttonText, // Can be a string or JSX (e.g., for hiding text on small screens)
  icon,       // Optional icon for the button itself
  buttonClassName = "", // Allows passing custom classes to Menu.Button
  menuItemsClassName = "", // Allows passing custom classes to Menu.Items
  dropdownAlign = "right", // 'left' or 'right' for dropdown alignment
}) => {
  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button
          className={`
            inline-flex items-center justify-center w-full 
            px-4 py-2 
            text-sm font-medium text-gray-700 
            bg-white border border-gray-300 rounded-lg 
            shadow-sm hover:bg-gray-50 
            focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
            transition-colors duration-150
            ${buttonClassName} 
          `}
        >
          {buttonText}
          <ChevronDownIcon
            className="ml-2 -mr-1 h-5 w-5 text-gray-400 hover:text-gray-500"
            aria-hidden="true"
          />
        </Menu.Button>
      </div>

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
          className={`
            absolute ${dropdownAlign === 'right' ? 'right-0' : 'left-0'} z-10 mt-2 
            w-56 origin-top-${dropdownAlign} 
            bg-white divide-y divide-gray-100 rounded-md 
            shadow-lg ring-1 ring-black ring-opacity-5 
            focus:outline-none
            ${menuItemsClassName}
          `}
        >
          <div className="px-1 py-1">
            {items.map((item) => (
              <Menu.Item key={item.key} disabled={item.disabled}>
                {({ active }) => (
                  <button
                    onClick={item.handler}
                    disabled={item.disabled}
                    className={`
                      group flex w-full items-center rounded-md 
                      px-3 py-2.5 text-sm
                      ${item.style || ""} 
                      ${
                        item.disabled
                          ? "text-gray-400 cursor-not-allowed"
                          : active
                          ? "bg-blue-500 text-white" // Active item style
                          : "text-gray-900 hover:bg-gray-100 hover:text-gray-900" // Default item style
                      }
                      transition-colors duration-150
                    `}
                  >
                    {item.icon && <span className="mr-3 h-5 w-5" aria-hidden="true">{item.icon}</span>}
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
