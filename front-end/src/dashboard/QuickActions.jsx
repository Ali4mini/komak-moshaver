// src/components/QuickAccess.js
import React from 'react';

// Reusable WidgetCard (can be moved to a shared components file if not already)
const WidgetCard = ({ title, children, className = "" }) => (
  <div className={`bg-white shadow-lg rounded-xl p-6 md:p-8 ${className}`}>
    <h2 className="text-xl lg:text-2xl font-semibold text-gray-700 mb-5 md:mb-6">{title}</h2>
    {children}
  </div>
);

// Individual Quick Action Button
const ActionButton = ({ text, icon, href = "#", bgColor = "bg-blue-500", hoverBgColor = "bg-blue-600", onClick }) => (
  <a
    href={href}
    onClick={onClick} // Allow onClick for actions that don't navigate (e.g., open a modal)
    className={`flex flex-col items-center justify-center text-center p-4 rounded-lg ${bgColor} ${hoverBgColor} text-white transition-colors duration-150 shadow hover:shadow-md h-full`}
  >
    {icon && <span className="text-3xl mb-2">{icon}</span>}
    <span className="text-sm font-medium">{text}</span>
  </a>
);

const QuickAccess = () => {
  const quickLinks = [
    {
      id: 1,
      text: 'ثبت ملک جدید', // Add New Property
      icon: '🏠',
      href: '/file/new', // Example route
      bgColor: 'bg-green-500',
      hoverBgColor: 'hover:bg-green-600',
    },
    {
      id: 2,
      text: 'افزودن مشتری جدید', // Add New Client/Lead
      icon: '👤', // Single user icon
      href: '/customer/new', // Example route
      bgColor: 'bg-sky-500',
      hoverBgColor: 'hover:bg-sky-600',
    },
    {
      id: 3,
      text: 'فایل ها', // Advanced Property Search
      icon: '🔍',
      href: '/', // Example route
      bgColor: 'bg-indigo-500',
      hoverBgColor: 'hover:bg-indigo-600',
    },
    {
      id: 4,
      text: 'گزارشات من', // My Reports
      icon: '📊',
      href: '/reports', // Example route
      bgColor: 'bg-amber-500',
      hoverBgColor: 'hover:bg-amber-600',
    },
    // Add more links as needed
    // {
    //   id: 5,
    //   text: 'تقویم من', // My Calendar
    //   icon: '📅',
    //   href: '/calendar',
    //   bgColor: 'bg-rose-500',
    //   hoverBgColor: 'hover:bg-rose-600',
    // },
  ];

  return (
      <div className="grid grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
        {quickLinks.map(link => (
          <ActionButton
            key={link.id}
            text={link.text}
            icon={link.icon}
            href={link.href}
            bgColor={link.bgColor}
            hoverBgColor={link.hoverBgColor}
            // onClick={link.onClickAction} // If you have non-navigation actions
          />
        ))}
      </div>
  );
};

export default QuickAccess;
