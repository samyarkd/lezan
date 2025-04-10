"use client";

import type { ReactNode } from "react";

import LetterBackground from "~/components/letter-background";
import { ThemeProvider } from "~/components/theme-provider";

export const Providers = (props: { children: ReactNode }) => {
  return (
    <ThemeProvider defaultTheme="dark">
      <LetterBackground>{props.children}</LetterBackground>
    </ThemeProvider>
  );
};
