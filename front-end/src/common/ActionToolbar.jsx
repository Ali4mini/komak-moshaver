// src/common/ActionToolbar.jsx
import React from 'react';
import SimpleTooltip from './SimpleTooltip'; // Assuming SimpleTooltip.jsx is in the same directory

const ActionToolbar = ({ items, itemClassName = "", className = "" }) => {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className={`flex items-center gap-0.5 ${className}`}> {/* gap-0.5 gives a small space */}
      {items.map((item) => (
        <SimpleTooltip key={item.key} text={item.label} position="top">
          <button
            type="button"
            onClick={item.handler}
            disabled={item.disabled}
            className={`
              flex items-center justify-center p-2 rounded-md
              transition-colors duration-150 ease-in-out
              focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 focus-visible:ring-offset-white 
              ${item.disabled
                ? "text-slate-400 cursor-not-allowed bg-slate-100" // Disabled state with a light bg
                : item.style // Custom style for specific buttons (e.g., delete)
                ? `${item.style}` // Apply custom text color and its hover states directly
                : "text-slate-600 hover:text-indigo-600 hover:bg-indigo-50" // Default active state
              }
              ${itemClassName}
            `}
            aria-label={item.label} // For accessibility
          >
            {/* Clone icon to ensure consistent sizing and pass through any existing classes */}
            {React.cloneElement(item.icon, {
              className: `w-5 h-5 ${item.icon.props.className || ''}`,
            })}
          </button>
        </SimpleTooltip>
      ))}
    </div>
  );
};

export default ActionToolbar;
