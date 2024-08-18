import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  userId: null,
};
const userslice = createSlice({
  name: "user",
  initialState,
  reducers: {
    login: (state, action) => {
      state.userId = action.payload.userId;
    },
    logout: (state) => {
      state.userId = null;
    },
  },
});
export const { login, logout } = userslice.actions;
export default userslice.reducer;
