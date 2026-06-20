import { SESSION_COOKIE_NAME } from "./constants";

type SessionCookieOptions = {
  httpOnly: true;
  secure: boolean;
  sameSite: "lax";
  path: "/";
  maxAge?: number;
};

export function sessionCookieOptions(maxAge?: number): SessionCookieOptions {
  const options: SessionCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  };

  if (maxAge !== undefined) {
    options.maxAge = maxAge;
  }

  return options;
}

export function clearedSessionCookie(): SessionCookieOptions {
  return sessionCookieOptions(0);
}

export { SESSION_COOKIE_NAME };
