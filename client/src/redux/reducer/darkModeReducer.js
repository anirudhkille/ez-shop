import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  darkMode: JSON.parse(localStorage.getItem("darkMode")) || false,
};

const darkModeReducer = createSlice({
  name: "darkMode",
  initialState,
  reducers: {
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
      localStorage.setItem("darkMode", JSON.stringify(state.darkMode));
    },
    enableDarkMode: (state) => {
      state.darkMode = true;
      localStorage.setItem("darkMode", JSON.stringify(true));
    },
    disableDarkMode: (state) => {
      state.darkMode = false;
      localStorage.setItem("darkMode", JSON.stringify(false));
    },
  },
});

export const { toggleDarkMode, enableDarkMode, disableDarkMode } =
  darkModeReducer.actions;

export default darkModeReducer.reducer;
