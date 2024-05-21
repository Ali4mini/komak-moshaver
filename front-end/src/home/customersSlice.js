import { createSlice } from "@reduxjs/toolkit";

export const customerSlice = createSlice({
  name: "customer",
  initialState: {
    customers: [],
    lastFilter: null,
  },
  reducers: {
    setCustomers: (state, action) => {
      state.customers = action.payload;
    },
    addCustomers: (state, action) => {
      state.customers.push(...action.payload); // Use spread operator to append new items
    },
    setLastFilter: (state, action) => {
      state.lastFilter = action.payload;
    },
    clearLastFilter: (state) => {
      state.lastFilter = null;
    },
  },
});

export const { setCustomers, setLastFilter, clearLastFilter, addCustomers } = customerSlice.actions;
export default customerSlice.reducer;
