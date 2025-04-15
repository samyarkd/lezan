import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import * as jose from "jose";

import { env } from "~/env";

const COOKIE_NAME = "turnstile_token_verified";

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/api/v1")) {
    const cookie = (await cookies()).get(COOKIE_NAME);
    if (!cookie) {
      return NextResponse.json(
        { success: false, message: "Human verification required." },
        { status: 403 },
      );
    }
    // console.log("cookie", cookie, env.AUTH_SECRET);

    console.log("hrere", cookie.value, env.AUTH_SECRET);
    try {
      const secret = new TextEncoder().encode(env.AUTH_SECRET);
      await jose.jwtVerify(cookie.value, secret);
    } catch (err) {
      console.log(err);

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
