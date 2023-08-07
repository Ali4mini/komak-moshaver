import { configureStore } from "@reduxjs/toolkit";
import filesSlice from "../home/filesSlice";
import customerSlice from "../home/customerSlice";

export default configureStore({
  reducer: {
    files: filesSlice,
    customers: customerSlice,
  },
});
