import { baseApi } from "@/lib/store/services/api";
import { authAction, User } from "./authSlice";
import { saveTokens, readTokens, clearTokens, isAuthTokens, type AuthTokens } from "./tokenStorage";

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest extends LoginRequest {
  name: string;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthTokens & { user: User }, LoginRequest>({
      async queryFn(body, { dispatch }, _, baseQuery) {
        const result = await baseQuery({ url: "/auth/login", method: "POST", body });
        if (result.error) return { error: result.error };

        const data = result.data as AuthTokens & { user: User };
        if (!isAuthTokens(data) || !data.user?.id) {
          return { error: { status: "CUSTOM_ERROR", error: "Invalid login response: missing tokens or user" } };
        }
        // Establish the session before unwrap() permits navigation.
        saveTokens(data);
        dispatch(authAction.getUser(data.user));
        return { data };
      },
    }),

    register: builder.mutation<User, RegisterRequest>({
      query: (body) => ({
        url: "/auth/register",
        method: "POST",
        body,
      }),
    }),

    getMe: builder.query<User, void>({
      query: () => ({
        url: "/auth/me",
        method: "GET",
      }),
      providesTags: ["Auth"],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        dispatch(authAction.setUserLoading(true));

        try {
          const { data } = await queryFulfilled;
          dispatch(authAction.getUser(data));
        } catch {
          dispatch(authAction.getUser(null));
        }
      },
    }),

    logout: builder.mutation<void, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
        body: { refreshToken: readTokens()?.refreshToken },
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          clearTokens();
          dispatch(authAction.clearAuth());
          dispatch(baseApi.util.resetApiState());
        } catch {
          // Keep session state until logout is confirmed
        }
      },
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetMeQuery,
  useLogoutMutation,
} = authApi;
