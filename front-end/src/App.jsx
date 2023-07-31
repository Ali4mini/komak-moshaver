import { useState } from "react";
import NavBar from "./common/nav";
import { Routes, Route } from "react-router-dom";
import Home from "./home/home";
import Login from "./agents/login";
import FileDetails from "./file/details";
import CustomerDetail from "./customer/details";
import Customer from "./home/customer_card";
import Customers from "./home/customers";
import NewFile from "./file/new";
import NewCustomer from "./customer/new";
import UpdateFile from "./file/update";
import UpdateCustomer from "./customer/update";

function App() {
  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
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
