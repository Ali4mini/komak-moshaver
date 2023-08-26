import NavBar from "./common/nav";
import { Routes, Route } from "react-router-dom";
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

function App() {
  const store = useSelector((state) => state.flash);

  return (
    <>
      <NavBar />
      {store.message ? (
        <ShowMessage type={store.type} message={store.message} />
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
          <Route path=":customerType/:id/edit/" element={<UpdateCustomer />} />
        </Route>
        <Route path="agents/login" element={<Login />}></Route>
      </Routes>
    </>
  );
}

export default App;
