import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  userDeatils: [],
};

const userReducer = createSlice({
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
export const { login, logout } = userReducer.actions;
export default userReducer.reducer;
