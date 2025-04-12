import { createSlice } from "@reduxjs/toolkit";

export const fileSlice = createSlice({
  name: "file",
  initialState: {
    relatedCustomers: null,
    customersToNotify: new Array(),
  },
  reducers: {
    setRelatedCustomers: (state, action) => {
      state.relatedCustomers = action.payload;
    },
    addToCustomersToNotify: (state, action) => {
      state.customersToNotify.push(action.payload);
    },
    removeFromCustomersToNotify: (state, action) => {
      state.customersToNotify.pop(action.payload);
    },
    ClearCustomersToNotify: (state) => {
      state.customersToNotify = [];
    },
  },
});

export const {
  setRelatedCustomers,
  addToCustomersToNotify,
  removeFromCustomersToNotify,
  ClearCustomersToNotify,
} = fileSlice.actions;
export default fileSlice.reducer;
