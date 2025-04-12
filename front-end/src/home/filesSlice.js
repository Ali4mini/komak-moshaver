import { createSlice } from "@reduxjs/toolkit";

export const filesSlice = createSlice({
  name: "files",
  initialState: {
    files: [],
    scannerFiles: [],
    restoreFiles: [],
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
    setRestoreFiles: (state, action) => {
      state.restoreFiles = action.payload;
    },
    addRestoreFiles: (state, action) => {
      state.restoreFiles.push(...action.payload); // Use spread operator to append new items
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

export const { setFiles,
  addFiles,
  setScannerFiles,
  setLastFilter,
  clearLastFilter,
  setLoading,
  setPageNumber,
  setRestoreFiles,
  addRestoreFiles

} = filesSlice.actions;

export default filesSlice.reducer;
