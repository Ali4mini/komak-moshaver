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
import { useEffect } from "react";
import Dashboard from "./dashboard/dashboard";
import NewCallLog from "./log_app/logs";

function App() {
  const navigate = useNavigate();
  const flashStore = useSelector((state) => state.flash);
  const isLoggedIn = localStorage.getItem("user");
  const width = window.innerWidth;


  // redirect to login if not logged in
  useEffect(() => {
    if (!isLoggedIn) {

      navigate('agents/login')
    }
  }, [isLoggedIn, navigate])

  if (isLoggedIn) {
    return (
      <>
        {width > 730 ? <NavBar /> : <MobileNavBar />}
        {flashStore.message ? (
          <ShowMessage type={flashStore.type} message={flashStore.message} />
        ) : null}
        <Routes>
          <Route path="/" element={<Files />} />
          <Route path="dashboard/" element={<Dashboard />} />
          <Route path="listing/" element={<Scanner />} />
          <Route path="agents/profile" element={<Profile />} />
          <Route path="customers/" element={<Customers />} />
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
      </>
    );
  }

  return (
    <>
      {flashStore.message ? (
        <ShowMessage type={flashStore.type} message={flashStore.message} />
      ) : null}
      <Routes>
        <Route path="agents/signup" element={<SignUp />} />
        <Route path="agents/login" element={<Login />} />
      </Routes>
    </>
  );
}

export default App;
