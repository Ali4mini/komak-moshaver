// src/common/SimpleTooltip.jsx
import React from 'react';

const SimpleTooltip = ({ text, children, position = 'top' }) => {
  let positionClasses = '';
  switch (position) {
    case 'top':
      positionClasses = 'bottom-full left-1/2 -translate-x-1/2 mb-1.5';
      break;
    case 'bottom':
      positionClasses = 'top-full left-1/2 -translate-x-1/2 mt-1.5';
      break;
    // Add 'left', 'right' if needed and adjust translations
    default:
      positionClasses = 'bottom-full left-1/2 -translate-x-1/2 mb-1.5'; // Default to top
      break;
  }

  return (
    <div className="relative group inline-flex"> {/* inline-flex helps with layout */}
      {children}
      <span
        className={`absolute ${positionClasses} z-30 whitespace-nowrap
                   rounded-md bg-slate-700 px-2 py-1 text-xs font-medium text-white
                   opacity-0 group-hover:opacity-100 transition-opacity duration-150
                   pointer-events-none shadow-lg`}
      >
        {text}
      </span>
    </div>
  );
};

export default SimpleTooltip;
