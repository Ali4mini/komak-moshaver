import { createSlice } from "@reduxjs/toolkit";

export const filesSlice = createSlice({
  name: "files",
  initialState: {
    files: null,
    scannerFiles: null,
    lastFilter: null,
  },
  reducers: {
    setFiles: (state, action) => {
      state.files = action.payload;
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
  },
});

export const { setFiles, setScannerFiles, setLastFilter, clearLastFilter } = filesSlice.actions;

export default filesSlice.reducer;
