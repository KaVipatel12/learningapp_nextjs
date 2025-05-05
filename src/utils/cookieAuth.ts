import { NextResponse } from "next/server";
const isProduction = process.env.NODE_ENV === "production";

export function setAuthCookie(response: NextResponse, token: string) {
  response.cookies.set("token", token, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30, // 30 days
    secure: isProduction,
    sameSite: "strict",
    path: "/",
  });

  return response;
}
