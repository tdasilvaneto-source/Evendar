import crypto from "node:crypto";
import { cookies } from "next/headers";

const COOKIE = "evendar_session";

function sign(raw: string) {
  const secret = process.env.SESSION_SECRET ?? "change-me";
  return crypto.createHmac("sha256", secret).update(raw).digest("hex");
}

export function createSession(username: string) {
  const payload = `${username}:${Date.now()}`;
  return `${payload}:${sign(payload)}`;
}

export function isValidSession(token?: string) {
  if (!token) return false;
  const [username, issuedAt, signature] = token.split(":");
  if (!username || !issuedAt || !signature) return false;
  const payload = `${username}:${issuedAt}`;
  return sign(payload) === signature;
}

export function isLoggedIn() {
  return isValidSession(cookies().get(COOKIE)?.value);
}

export function authCookieName() {
  return COOKIE;
}
