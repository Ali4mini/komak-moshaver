import { createSlice } from "@reduxjs/toolkit";

export const filesSlice = createSlice({
  name: "files",
  initialState: {
    files: null,
    scannerFiles: null
  },
  reducers: {
    setFiles: (state, action) => {
      state.files = action.payload;
    },
    setScannerFiles: (state, action) => {
      state.scannerFiles = action.payload
    }
  },
});

export const { setFiles, setScannerFiles } = filesSlice.actions

export default filesSlice.reducer