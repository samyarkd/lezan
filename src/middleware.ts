import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import * as jose from "jose";

import { env } from "~/env";
import { TURNSTILE_COOKIE_NAME } from "./lib/constants.global";

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/api/v1")) {
    const cookie = (await cookies()).get(TURNSTILE_COOKIE_NAME);
    if (!cookie) {
      return NextResponse.json(
        { success: false, message: "Human verification required." },
        { status: 403 },
      );
    }

    try {
      const secret = new TextEncoder().encode(env.AUTH_SECRET);
      await jose.jwtVerify(cookie.value, secret);
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid verification token." },
        { status: 403 },
      );
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/api/v1/:path*"],
};
