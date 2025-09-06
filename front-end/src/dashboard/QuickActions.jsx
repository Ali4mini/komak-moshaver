// src/components/QuickAccess.js
import React from "react";
import { useNavigate } from "react-router-dom";

// Reusable WidgetCard (can be moved to a shared components file if not already)
const WidgetCard = ({ title, children, className = "" }) => (
  <div className={`bg-white shadow-lg rounded-xl p-6 md:p-8 ${className}`}>
    <h2 className="text-xl lg:text-2xl font-semibold text-gray-700 mb-5 md:mb-6">
      {title}
    </h2>
    {children}
  </div>
);

// Individual Quick Action Button
const ActionButton = ({
  text,
  icon,
  bgColor = "bg-blue-500",
  hoverBgColor = "bg-blue-600",
  onClick,
  disabled = false,
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`flex flex-col items-center justify-center text-center p-4 rounded-lg ${bgColor} ${hoverBgColor} text-white transition-colors duration-150 shadow hover:shadow-md h-full w-full ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} `}
  >
    {icon && <span className="text-3xl mb-2">{icon}</span>}
    <span className="text-sm font-medium">{text}</span>
  </button>
);

const QuickAccess = () => {
  const navigate = useNavigate();

  const quickLinks = [
    {
      id: 1,
      text: "ثبت ملک جدید", // Add New Property
      icon: "🏠",
      path: "/file/new",
      bgColor: "bg-green-500",
      hoverBgColor: "hover:bg-green-600",
    },
    {
      id: 2,
      text: "افزودن مشتری جدید", // Add New Client/Lead
      icon: "👤", // Single user icon
      path: "/customer/new",
      bgColor: "bg-sky-500",
      hoverBgColor: "hover:bg-sky-600",
    },
    {
      id: 3,
      text: "فایل ها", // Advanced Property Search
      icon: "🔍",
      path: "/files/",
      bgColor: "bg-indigo-500",
      hoverBgColor: "hover:bg-indigo-600",
    },
    {
      id: 4,
      text: "گزارشات من", // My Reports
      icon: "📊",
      path: "/reports",
      bgColor: "bg-amber-600",
      hoverBgColor: "hover:bg-amber-700",
      disabled: true,
    },
    // Add more links as needed
    // {
    //   id: 5,
    //   text: 'تقویم من', // My Calendar
    //   icon: '📅',
    //   path: '/calendar',
    //   bgColor: 'bg-rose-500',
    //   hoverBgColor: 'hover:bg-rose-600',
    // },
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className="grid grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
      {quickLinks.map((link) => (
        <ActionButton
          key={link.id}
          text={link.text}
          icon={link.icon}
          bgColor={link.bgColor}
          hoverBgColor={link.hoverBgColor}
          onClick={() => handleNavigation(link.path)}
          disabled={link.disabled}
        />
      ))}
    </div>
  );
};

export default QuickAccess;
