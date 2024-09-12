import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./reducer/cartReducer";
import userReducer from "./reducer/userReducer";
import { userAPI } from "./api/userAPI";

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    user: userReducer,
    [userAPI.reducerPath]: userAPI.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(userAPI.middleware),
});

export default store;
