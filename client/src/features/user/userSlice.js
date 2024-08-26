import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  userDeatils: [],
};

const userslice = createSlice({
  name: "user",
  initialState,
  reducers: {
    login: (state, action) => {
      state.user = action.payload.userDeatils;
    },
    logout: (state) => {
      state.user = [];
    },
  },
});
export const { login, logout } = userslice.actions;
export default userslice.reducer;
