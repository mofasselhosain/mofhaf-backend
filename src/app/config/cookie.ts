import type { CookieOptions } from "express";
import config from "./index";

const isProduction = config.node_env === "production";

export const authCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  path: "/",
};

export const accessTokenCookieOptions: CookieOptions = {
  ...authCookieOptions,
  maxAge: 1000 * 60 * 60 * 24, // 1 day
};

export const refreshTokenCookieOptions: CookieOptions = {
  ...authCookieOptions,
  maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
};