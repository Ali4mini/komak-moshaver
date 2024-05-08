import { configureStore } from "@reduxjs/toolkit";
import filesSlice from "../home/filesSlice";
import customersSlice from "../home/customersSlice";
import flashSlice from "./flashSlice";
import fileSlice from "../file/fileSlice";
import customerSlice from "../customer/customerSlice";

export default configureStore({
  reducer: {
    files: filesSlice,
    customers: customersSlice,
    flash: flashSlice,
    file: fileSlice,
    customer: customerSlice
  },
});
