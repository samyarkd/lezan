import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import * as jose from "jose";

import { env } from "~/env";

const COOKIE_NAME = "turnstile_token_verified";
const COOKIE_MAX_AGE = 3600; // 1 hour

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();
    if (!token) {
      return NextResponse.json(
        { success: false, message: "Missing Turnstile token." },
        { status: 400 },
      );
    }

    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          secret: env.TURNSTILE_SECRET_KEY,
          response: token,
        }),
      },
    );
    const data = await response.json();

    if (!data.success) {
      return NextResponse.json(
        { success: false, message: "Invalid Turnstile token.", data },
        { status: 403 },
      );
    }

    const secret = new TextEncoder().encode(env.AUTH_SECRET);
    const alg = "HS256";

    // Create a signed JWT as the cookie value
    const jwtToken = await new jose.SignJWT()
      .setIssuedAt()
      .setProtectedHeader({ alg })
      .setExpirationTime("2h")
      .sign(secret);

    (await cookies()).set(COOKIE_NAME, jwtToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.log("errr", error);

    return NextResponse.json(
      { success: false, message: "Error validating Turnstile token." },
      { status: 500 },
    );
  }
}
