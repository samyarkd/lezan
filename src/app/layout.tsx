import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { cookies } from "next/headers";
import * as jose from "jose";

import { Providers } from "~/components/providers";
import { env } from "~/env";
import { TURNSTILE_COOKIE_NAME } from "~/lib/constants.global";
import { auth } from "~/server/auth";

export const metadata: Metadata = {
  title: "Lezan | Learn a new phrase/word with AI",
  description:
    "Lezan is an AI language assistant that helps intermediate learners improve their language skills through daily phrases and sentences from various sources like music, books, and more. Generate flashcards, take quizzes, and track your progress.",
  icons: [
    {
      rel: "icon",
      url: "https://k3xjza6cj4.ufs.sh/f/Lrk4wyv15ApkhNGC3xLpz8aFL75qJykIH9YjMmcgERvu6TeK",
    },
  ],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();

  const reqCookies = await cookies();
  let isVerified = false;
  const token = reqCookies.get(TURNSTILE_COOKIE_NAME)?.value;

  if (token) {
    try {
      const secret = new TextEncoder().encode(env.AUTH_SECRET);
      await jose.jwtVerify(token, secret);
      isVerified = true;
    } catch {
      isVerified = false;
    }
  }

  return (
    <html
      lang="en"
      className={`${geist.variable}`}
      suppressHydrationWarning={true}
      data-lt-installed="true"
    >
      <body cz-shortcut-listen="true">
        <Providers isVerified={isVerified} session={session}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
