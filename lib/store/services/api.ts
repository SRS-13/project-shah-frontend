
import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { readTokens, saveTokens, clearTokens, isAuthTokens } from "@/features/auth/tokenStorage";

const fetchQuery = fetchBaseQuery({
  baseUrl: "http://localhost:4000/api/v1/",
  prepareHeaders: (headers) => {
    const tokens = readTokens();
    if (tokens) headers.set("Authorization", `Bearer ${tokens.accessToken}`);
    return headers;
  },
});

// Nest's global ResponseInterceptor wraps successful responses.
const rawBaseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await fetchQuery(args, api, extraOptions);
  const body = result.data;
  if (
    body !== null && typeof body === "object" &&
    "success" in body && body.success === true && "data" in body
  ) {
    return { ...result, data: body.data };
  }
  return result;
};

let refreshInFlight: Promise<boolean> | null = null;

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
    if (!refreshInFlight) {
      refreshInFlight = (async () => {
        const tokens = readTokens();
        if (!tokens) return false;
        const refreshResult = await rawBaseQuery(
          {
            url: "/auth/refresh",
            method: "POST",
            body: { refreshToken: tokens.refreshToken },
          },
          api,
          extraOptions
        );
        if (isAuthTokens(refreshResult.data)) {
          saveTokens(refreshResult.data);
          return true;
        }
        return false;
      })().finally(() => {
        refreshInFlight = null;
      });
    }

    if (await refreshInFlight) {
      // Retry original request after session refresh.
      result = await rawBaseQuery(args, api, extraOptions);
    } else {
      clearTokens();
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
    "Organization",
    "OrganizationMember",
    "OrganizationInvitation",
    "ProjectMember"
  ],

  endpoints: () => ({}),
});

export default baseApi;
