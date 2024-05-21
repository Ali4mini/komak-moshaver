import { createSlice } from "@reduxjs/toolkit";

export const filesSlice = createSlice({
  name: "files",
  initialState: {
    files: [],
    scannerFiles: [],
    lastFilter: null,
    pageNumber: 1,
    isLoading: false,
  },
  reducers: {
    setFiles: (state, action) => {
      state.files = action.payload;
    },
    addFiles: (state, action) => {
      state.files.push(...action.payload); // Use spread operator to append new items
    },
    setScannerFiles: (state, action) => {
      state.scannerFiles = action.payload;
    },
    setLastFilter: (state, action) => {
      state.lastFilter = action.payload;
    },
    clearLastFilter: (state) => {
      state.lastFilter = null;
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setPageNumber: (state, action) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setFiles, addFiles, setScannerFiles, setLastFilter, clearLastFilter, setLoading, setPageNumber } = filesSlice.actions;

export default filesSlice.reducer;
