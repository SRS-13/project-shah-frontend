
import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: "http://localhost:4000/api/v1/",
});

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  const url = typeof args === "string" ? args : args.url;

  const isAuthRequest = [
    "/auth/login",
    "/auth/register",
    "/auth/refresh",
    "/auth/logout",
  ].some((path) => url.includes(path));

  // Attempt refresh when an access token expires.
  if (result.error?.status === 401 && !isAuthRequest) {
    const refreshResult = await rawBaseQuery(
      {
        url: "/auth/refresh",
        method: "POST",
      },
      api,
      extraOptions
    );

    if (refreshResult.data) {
      // Retry original request after session refresh.
      result = await rawBaseQuery(args, api, extraOptions);
    } else {
      // The server should clear expired auth cookies.
      // Do not delete unrelated browser cookies.
      api.dispatch({ type: "auth/clearAuth" });
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: "splitApi",

  baseQuery: baseQueryWithReauth,

  refetchOnReconnect: true,

  tagTypes: [
    "Auth",
    "User",
    "Workspace",
    "Project",
    "Task",
  ],

  endpoints: () => ({}),
});

export default baseApi;
