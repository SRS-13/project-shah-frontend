export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

const key = "teamflow.tokens";

export function isAuthTokens(value: unknown): value is AuthTokens {
  if (!value || typeof value !== "object") return false;
  const tokens = value as Partial<AuthTokens>;
  return typeof tokens.accessToken === "string" && tokens.accessToken.length > 0 &&
    typeof tokens.refreshToken === "string" && tokens.refreshToken.length > 0;
}

export function readTokens(): AuthTokens | null {
  if (typeof window === "undefined") return null;
  try {
    const value = JSON.parse(window.localStorage.getItem(key) ?? "null");
    return isAuthTokens(value) ? value : null;
  } catch {
    return null;
  }
}

export function saveTokens(tokens: AuthTokens) {
  if (!isAuthTokens(tokens)) throw new Error("Authentication response is missing tokens");
  if (typeof window !== "undefined") {
    window.localStorage.setItem(key, JSON.stringify({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    }));
  }
}

export function clearTokens() {
  if (typeof window !== "undefined") window.localStorage.removeItem(key);
}
