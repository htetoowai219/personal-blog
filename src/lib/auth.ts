import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "JWT_SECRET environment variable is required in production. Set it in your Vercel project settings."
      );
    }
    return "personal-blog-dev-secret-do-not-use-in-production";
  }
  return secret;
}

export interface AuthUser {
  userId: string;
  username: string;
}

export function signToken(user: AuthUser): string {
  return jwt.sign(user, getJwtSecret(), { expiresIn: "7d" });
}

export function verifyToken(token: string): AuthUser | null {
  try {
    return jwt.verify(token, getJwtSecret()) as AuthUser;
  } catch {
    return null;
  }
}

export function getUserFromRequest(request: NextRequest): AuthUser | null {
  const token = request.cookies.get("token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export function setAuthCookie(response: NextResponse, token: string) {
  response.cookies.set("token", token, {
    ...AUTH_COOKIE_OPTIONS,
    maxAge: 60 * 60 * 24 * 7,
  });
}

export function clearAuthCookie(response: NextResponse) {
  response.cookies.set("token", "", {
    ...AUTH_COOKIE_OPTIONS,
    maxAge: 0,
  });
}
