import { configureStore } from "@reduxjs/toolkit";
import filesSlice from "../home/filesSlice";
import customerSlice from "../home/customersSlice";
import flashSlice from "./flashSlice";
import fileSlice from "../file/fileSlice";

export default configureStore({
  reducer: {
    files: filesSlice,
    customers: customerSlice,
    flash: flashSlice,
    file: fileSlice,
  },
});
