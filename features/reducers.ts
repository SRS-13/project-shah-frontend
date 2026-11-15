import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "./auth/authSlice";
import { baseApi } from "@/lib/store/services/api";

const rootReducer = combineReducers({
  auth: authReducer,
  [baseApi.reducerPath]: baseApi.reducer,
});

export default rootReducer;
