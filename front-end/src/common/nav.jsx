// src/common/nav.jsx
import { NavLink, Link } from "react-router-dom";
import SearchButtonWithModal from "../home/search.jsx"; // Adjust path if needed
import { api } from "../common/api";
import { useEffect, useState } from "react";
import LogOutConfirm from "./logout_confirm"; // Adjust path if needed

// --- Simpler SVG Icons ---
const DashboardIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" /><path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" /></svg>
);
const FilesIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" /></svg>
);
const RobotIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /><circle cx="10" cy="15" r="1" /><circle cx="7" cy="15" r="1" /><circle cx="13" cy="15" r="1" /></svg>
);
const RestoreIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" /></svg>
);
const NewFileIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" /><path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" /><path fillRule="evenodd" d="M10 12a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1H8a1 1 0 110-2h1v-1a1 1 0 011-1z" clipRule="evenodd" /></svg>
);
const NewCustomerIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 11a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1v-1z" /></svg>
);
const CustomersIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" /></svg>
);
const PersonsIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
);
const SmsLogsIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" /></svg>
);
const LogoutIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" /></svg>
);
const SearchIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>
);
const ExpandIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>
);
const CollapseIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
);
// --- End SVG Icons ---


const NavBar = () => {
  const [isExpanded, setIsExpanded] = useState(false); // Internal state for expansion
  const [scannerFilesCount, setScannerFilesCount] = useState(0);
  const [restoreFilesCount, setRestoreFilesCount] = useState(0);
  const [isLogOutConfirm, setIsLogOutConfirm] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  useEffect(() => {
    // api.get("listing/?count", { params: { owner_name: "UNKNOWN", status: "ACTIVE", count: null } })
    //   .then((response) => setScannerFilesCount(response.data["count"]))
    //   .catch((error) => console.log("Error fetching scanner files count:", error));
    api.get("listing/restore/?count")
      .then((response) => setRestoreFilesCount(response.data["count"]))
      .catch((error) => console.log("Error fetching restore files count:", error));
  }, []);

  const navItemTextClasses =
    `ml-3 text-sm font-medium whitespace-nowrap transition-opacity duration-150 ease-in-out 
     ${isExpanded ? "opacity-100 delay-100" : "opacity-0 w-0 pointer-events-none"}`;

  const NavLinkItem = ({ to, icon: Icon, label, badgeCount }) => {
    const commonItemClasses = "flex items-center h-11 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-60 transition-colors duration-150 group relative";
    
    const activeClassesExpanded = "bg-blue-100 text-blue-700";
    const inactiveClassesExpanded = "text-gray-700 hover:bg-gray-100";
    
    const activeClassesCollapsed = "bg-blue-600 text-white"; // Active state for collapsed icon
    const inactiveClassesCollapsed = "text-gray-600 hover:bg-gray-200";

    return (
      <div className="relative">
        <NavLink
          to={to}
          end={to === "/"} // Ensures exact match for the root path
          className={({ isActive }) =>
            `${commonItemClasses} ${
              isExpanded
                ? `px-3 justify-start ${isActive ? activeClassesExpanded : inactiveClassesExpanded}`
                : `w-11 justify-center ${isActive ? activeClassesCollapsed : inactiveClassesCollapsed}`
            }`
          }
          title={!isExpanded ? label : undefined} // HTML title for tooltip on hover when collapsed
        >
          <div className={`flex-shrink-0 w-6 h-6 flex items-center justify-center`}>
            <Icon className="w-5 h-5" />
          </div>
          {isExpanded && <span className={navItemTextClasses}>{label}</span>}
        </NavLink>
        {/* Custom Tooltip for collapsed state */}
        {!isExpanded && (
            <span className="absolute top-1/2 -translate-y-1/2 right-full mr-3 z-20
                             whitespace-nowrap px-2 py-1 bg-gray-700 text-white text-xs rounded-md shadow-lg
                             opacity-0 group-hover:opacity-100 group-hover:delay-200 transition-all duration-150 pointer-events-none">
              {label}
            </span>
        )}
        {/* Badge */}
        {badgeCount > 0 && (
          <span
            className={`absolute text-white text-[0.65rem] font-semibold px-1.5 py-0.5 rounded-full transition-all duration-200 ease-in-out pointer-events-none
              ${isExpanded 
                ? `top-1/2 -translate-y-1/2 right-3 bg-red-500 ${isExpanded ? 'opacity-100 delay-100' : 'opacity-0'}` // Badge next to text
                : `top-1.5 right-1.5 bg-red-600 transform scale-75` // Smaller badge on icon
              }`}
          >
            {isExpanded ? badgeCount : (badgeCount > 9 ? '9+' : badgeCount)}
          </span>
        )}
      </div>
    );
  };

  const NavButtonItem = ({ onClick, icon: Icon, label }) => {
    const commonItemClasses = "flex items-center h-11 w-full rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-60 transition-colors duration-150 group relative";
    const expandedClasses = "px-3 justify-start text-gray-700 hover:bg-gray-100";
    const collapsedClasses = "w-11 justify-center text-gray-600 hover:bg-gray-200";

    return (
      <div className="relative">
        <button
          onClick={onClick}
          className={`${commonItemClasses} ${isExpanded ? expandedClasses : collapsedClasses}`}
          title={!isExpanded ? label : undefined}
        >
          <div className={`flex-shrink-0 w-6 h-6 flex items-center justify-center`}>
            <Icon className="w-5 h-5" />
          </div>
          {isExpanded && <span className={navItemTextClasses}>{label}</span>}
        </button>
        {!isExpanded && (
            <span className="absolute top-1/2 -translate-y-1/2 right-full mr-3 z-20
                             whitespace-nowrap px-2 py-1 bg-gray-700 text-white text-xs rounded-md shadow-lg
                             opacity-0 group-hover:opacity-100 group-hover:delay-200 transition-all duration-150 pointer-events-none">
              {label}
            </span>
        )}
      </div>
    );
  };

  return (
    <>
      {isLogOutConfirm && <LogOutConfirm isOpen={isLogOutConfirm} setIsOpen={setIsLogOutConfirm} />}
      {isSearchModalOpen && <SearchButtonWithModal isOpen={isSearchModalOpen} setIsOpen={setIsSearchModalOpen} />}

      <nav
        id="NavBar"
        className={`fixed top-0 right-0 h-screen bg-white border-l border-gray-200 shadow-xl
                   flex flex-col z-50 transition-all duration-300 ease-in-out 
                   ${isExpanded ? "w-60 p-4 space-y-1.5" : "w-[4.25rem] p-3 space-y-1"}`}
      >
        {/* Header: Logo (when expanded) and Toggle Button */}
        <div className={`flex items-center mb-4 h-10 ${isExpanded ? 'justify-between' : 'justify-center'}`}>
          {isExpanded && (
            <Link to="/dashboard" className="text-xl font-semibold text-blue-700 ml-2">
              CRM من
            </Link>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)} // Toggles internal state
            className="p-2 rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label={isExpanded ? "Collapse menu" : "Expand menu"}
          >
            {isExpanded ? <CollapseIcon /> : <ExpandIcon />}
          </button>
        </div>

        {/* Scrollable Navigation Items Area */}
        <div className="flex-grow overflow-y-auto overflow-x-hidden pr-1 space-y-1">
            <NavLinkItem to="/" icon={DashboardIcon} label="داشبورد" />
            <NavLinkItem to="files/" icon={FilesIcon} label="فایل ها" />
            <NavLinkItem to="listing/" icon={RobotIcon} label="ربات" badgeCount={scannerFilesCount} />
            <NavLinkItem to="restore/" icon={RestoreIcon} label="احیا" badgeCount={restoreFilesCount} />
            <NavLinkItem to="file/new" icon={NewFileIcon} label="فایل جدید" />
            <NavLinkItem to="customer/new" icon={NewCustomerIcon} label="مشتری جدید" />
            <NavLinkItem to="/customers" icon={CustomersIcon} label="مشتری ها" />
            <NavLinkItem to="persons/" icon={PersonsIcon} label="اشخاص" />
            <NavLinkItem to="smsLogs/" icon={SmsLogsIcon} label="sms" />
        </div>

        {/* Footer Buttons Area */}
        <div className="mt-auto pt-2 border-t border-gray-200">
          <NavButtonItem onClick={() => setIsSearchModalOpen(true)} icon={SearchIcon} label="جستجو" />
          <NavButtonItem onClick={() => setIsLogOutConfirm(true)} icon={LogoutIcon} label="خروج" />
        </div>
      </nav>
    </>
  );
};

export default NavBar;
