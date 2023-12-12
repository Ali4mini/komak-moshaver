import NavBar from "./common/nav";
import MobileNavBar from "./common/mobile_nav";
import { Routes, Route, useNavigate } from "react-router-dom";
import Login from "./agents/login";
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

function App() {
  const navigate = useNavigate();
  const flashStore = useSelector((state) => state.flash);
  const hasAccessToken = localStorage.getItem("access_token");
  const isLoggedIn = localStorage.getItem("user_id");
  let width = window.innerWidth;

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("agents/login");
    }
  }, []);

  if (isLoggedIn) {
    return (
      <>
        {width > 730 ? <NavBar /> : <MobileNavBar />}
        {flashStore.message ? (
          <ShowMessage type={flashStore.type} message={flashStore.message} />
        ) : null}
        <Routes>
          <Route path="/" element={<Files />} />
          <Route path="listing/" element={<Scanner />} />
          <Route path="customers/" element={<Customers />} />
          <Route path="file/">
            <Route path="new/" element={<NewFile />} />
            <Route path=":fileType/:id" element={<FileDetails />} />
            <Route path=":fileType/:id/edit/" element={<UpdateFile />} />
          </Route>
          <Route path="customer/">
            <Route path="new/" element={<NewCustomer />} />
            <Route path=":customerType/:id" element={<CustomerDetail />} />
            <Route
              path=":customerType/:id/edit/"
              element={<UpdateCustomer />}
            />
          </Route>
        </Routes>
      </>
    );
  } else {
    return (
      <>
        {flashStore.message ? (
          <ShowMessage type={flashStore.type} message={flashStore.message} />
        ) : null}
        <Routes>
          <Route path="agents/login" element={<Login />}></Route>
        </Routes>{" "}
      </>
    );
  }
}

export default App;
