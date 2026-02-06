import { NextResponse } from "next/server";
import { authCookieName, createSession } from "@/lib/auth";

export async function POST(request: Request) {
  const body = (await request.json()) as { username?: string; password?: string };
  const username = process.env.APP_USERNAME ?? "admin";
  const password = process.env.APP_PASSWORD ?? "admin";

  if (body.username !== username || body.password !== password) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(authCookieName(), createSession(username), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/"
  });
  return response;
}
