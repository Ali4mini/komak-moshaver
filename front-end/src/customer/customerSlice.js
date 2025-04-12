import { createSlice } from "@reduxjs/toolkit";

export const customerSlice = createSlice({
  name: "customer",
  initialState: {
    relatedFiles: null,
    filesToNotify: new Array(),
  },
  reducers: {
    setRelatedFiles: (state, action) => {
      state.relatedFiles = action.payload;
    },
    addToFilesToNotify: (state, action) => {
      state.filesToNotify.push(action.payload);
    },
    removeFromFilesToNotify: (state, action) => {
      state.filesToNotify.pop(action.payload);
    },
    ClearfilesToNotify: (state) => {
      state.filesToNotify = [];
    },
  },
});

export const {
  setRelatedFiles,
  addToFilesToNotify,
  removeFromFilesToNotify,
  ClearFilesToNotify,
} = customerSlice.actions;
export default customerSlice.reducer;
