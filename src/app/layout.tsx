import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

export const metadata: Metadata = {
  title: "Lezan | Learn a new phrase/word with AI",
  description:
    "Lezano is an AI language assistant that helps intermediate learners improve their language skills through daily phrases and sentences from various sources like music, books, and more. Generate flashcards, take quizzes, and track your progress.",
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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geist.variable}`}
      suppressHydrationWarning={true}
      data-lt-installed="true"
    >
      <body>{children}</body>
    </html>
  );
}
