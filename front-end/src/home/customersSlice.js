import { createSlice } from "@reduxjs/toolkit";

export const customerSlice = createSlice({
  name: "customer",
  initialState: {
    customers: null,
    lastFilter: null,
  },
  reducers: {
    setCustomers: (state, action) => {
      state.customers = action.payload;
    },
    setLastFilter: (state, action) => {
      state.lastFilter = action.payload;
    },
    clearLastFilter: (state) => {
      state.lastFilter = null;
    },
  },
});

export const { setCustomers, setLastFilter, clearLastFilter } = customerSlice.actions;
export default customerSlice.reducer;
