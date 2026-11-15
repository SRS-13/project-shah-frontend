
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthState {
  user: User | null;
  userLoading: boolean;
  isHydrated: boolean;

  // Modal states
  signInOpen: boolean;
  signUpOpen: boolean;
  forgotPasswordOpen: boolean;

  // Modal data
  forgotPasswordEmail: string;
  logOutLoad: boolean;
}

const initialState: AuthState = {
  user: null,
  userLoading: true,
  isHydrated: false,

  signInOpen: false,
  signUpOpen: false,
  forgotPasswordOpen: false,

  forgotPasswordEmail: "",
  logOutLoad: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Called after session validation on app startup
    hydrateFromStorage(state) {
      state.isHydrated = true;
    },

    getUser(state, action: PayloadAction<User | null>) {
      state.user = action.payload;
      state.userLoading = false;
      state.isHydrated = true;
    },

    setUserLoading(state, action: PayloadAction<boolean>) {
      state.userLoading = action.payload;
    },

    setLogOutLoading(state, action: PayloadAction<boolean>) {
      state.logOutLoad = action.payload;
    },

    setSignInOpen(state, action: PayloadAction<boolean>) {
      state.signInOpen = action.payload;
    },

    setSignUpOpen(state, action: PayloadAction<boolean>) {
      state.signUpOpen = action.payload;
    },

    setForgotPasswordOpen(
      state,
      action: PayloadAction<{
        open: boolean;
        email?: string;
      }>
    ) {
      state.forgotPasswordOpen = action.payload.open;

      if (action.payload.email !== undefined) {
        state.forgotPasswordEmail = action.payload.email;
      }
    },

    openSignUpFromSignIn(state) {
      state.signInOpen = false;
      state.signUpOpen = true;
    },

    openSignInFromSignUp(state) {
      state.signUpOpen = false;
      state.signInOpen = true;
    },

    openForgotPasswordFromSignIn(
      state,
      action: PayloadAction<string>
    ) {
      state.signInOpen = false;
      state.forgotPasswordOpen = true;
      state.forgotPasswordEmail = action.payload;
    },

    closeAllModals(state) {
      state.signInOpen = false;
      state.signUpOpen = false;
      state.forgotPasswordOpen = false;
      state.forgotPasswordEmail = "";
    },

    updateUser(state, action: PayloadAction<Partial<User>>) {
      if (state.user) {
        state.user = {
          ...state.user,
          ...action.payload,
        };
      }
    },

    clearAuth(state) {
      state.user = null;
      state.userLoading = false;
      state.isHydrated = true;
      state.logOutLoad = false;
      state.signInOpen = false;
      state.signUpOpen = false;
      state.forgotPasswordOpen = false;
      state.forgotPasswordEmail = "";
    },
  },
});

export const authAction = authSlice.actions;
export default authSlice.reducer;
