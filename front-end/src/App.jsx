// src/App.js
import React, { useState, useEffect } from 'react'; // Added useState
import NavBar from "./common/nav";
import MobileNavBar from "./common/mobile_nav";
import { Routes, Route, useNavigate } from "react-router-dom";
import Login from "./agents/login";
import SignUp from "./agents/signup";
import Profile from "./agents/profile";
import FileDetails from "./file/details";
import CustomerDetail from "./customer/details";
import Customers from "./home/customers";
import NewFile from "./file/new";
import NewCustomer from "./customer/new";
import UpdateFile from "./file/update";
import UpdateCustomer from "./customer/update";
import Files from "./home/files";
import Scanner from "./home/scanner";
import ShowMessage from "./common/flash";
import { useSelector } from "react-redux";
import Dashboard from "./dashboard/dashboard";
import Restore from "./home/restore";
import SmsLogsListPage from "./log_app/smsLogsList";
import PersonList from "./person/persons.jsx";
import PersonDetailsPage from "./person/personsDetails.jsx";

function App() {
  const navigate = useNavigate();
  const flashStore = useSelector((state) => state.flash);
  const isLoggedIn = localStorage.getItem("user");
  const width = window.innerWidth;

  // State to manage NavBar expansion for layout adjustments
  const [isNavExpanded, setIsNavExpanded] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('agents/login');
    }
  }, [isLoggedIn, navigate]);

  // Define widths for margin calculation
  const collapsedNavWidthClass = "mr-[4.25rem]"; // Should match NavBar's collapsed width
  const expandedNavWidthClass = "mr-60";       // Should match NavBar's expanded width

  if (isLoggedIn) {
    return (
      <div className="flex min-h-screen bg-gray-50"> {/* Outer container */}
        {/* Main content area */}
        <main 
          className={`flex-1 transition-all duration-300 ease-in-out
                      ${width > 730 && isNavExpanded ? expandedNavWidthClass : 
                       width > 730 ? collapsedNavWidthClass : ''}`} 
                      // Apply margin only if desktop nav is active
        >
          {flashStore.message ? (
            <div className="sticky top-0 z-50"> {/* Position flash message appropriately */}
              <ShowMessage type={flashStore.type} message={flashStore.message} />
            </div>
          ) : null}
          
          {/* Add padding to the content area itself */}
          <div className="p-4 md:p-6"> 
            <Routes>
              <Route path="/" element={<Files />} />
              <Route path="dashboard/" element={<Dashboard />} />
              <Route path="listing/" element={<Scanner />} />
              <Route path="restore/" element={<Restore />} />
              <Route path="smsLogs/" element={<SmsLogsListPage />} />
              <Route path="agents/profile" element={<Profile />} />
              <Route path="customers/" element={<Customers />} />
              <Route path="persons/" element={<PersonList />} />
              <Route path="persons/:id" element={<PersonDetailsPage />} />
              <Route path="file/">
                <Route path="new/" element={<NewFile />} />
                <Route path=":fileType/:id" element={<FileDetails />} />
                <Route path=":fileType/:id/edit/" element={<UpdateFile />} />
              </Route>
              <Route path="customer/">
                <Route path="new/" element={<NewCustomer />} />
                <Route path=":customerType/:id" element={<CustomerDetail />} />
                <Route path=":customerType/:id/edit/" element={<UpdateCustomer />} />
              </Route>
            </Routes>
          </div>
        </main>

        {/* Navigation Bars */}
        {width > 730 ? (
          <NavBar 
            isExpanded={isNavExpanded}
            onNavMouseEnter={() => setIsNavExpanded(true)}
            onNavMouseLeave={() => setIsNavExpanded(false)}
          />
        ) : (
          <MobileNavBar /> // Assuming MobileNavBar handles its own layout or isn't fixed to overlap
        )}
      </div>
    );
  }

  // Non-logged-in routes
  return (
    <>
      {flashStore.message ? (
        <ShowMessage type={flashStore.type} message={flashStore.message} />
      ) : null}
      <Routes>
        <Route path="agents/signup" element={<SignUp />} />
        <Route path="agents/login" element={<Login />} />
        {/* You might want a catch-all or redirect here if an unknown path is hit */}
      </Routes>
    </>
  );
}

export default App;
