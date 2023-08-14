import { createSlice } from "@reduxjs/toolkit";

export const flashSlice = createSlice({
  name: "flash",
  initialState: {
    type: "INFO",
    message: null,
  },
  reducers: {
    setFlashMessage: (state, action) => {
      state.type = action.payload.type;
      state.message = action.payload.message;
    },
    clearFlashMessage: (state) => {
      state.type = "INFO";
      state.message = null;
    },
  },
});

export const { setFlashMessage, clearFlashMessage } = flashSlice.actions;
export default flashSlice.reducer;
