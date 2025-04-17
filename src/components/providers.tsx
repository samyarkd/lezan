"use client";

import { useRef, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

import LetterBackground from "~/components/letter-background";
import { ThemeProvider } from "~/components/theme-provider";
import { AppSidebar } from "./app-sidebar";
import AuthButton from "./AuthButton";
import TurnstileVerifier from "./turnstile-verifier";
import { SidebarProvider, SidebarTrigger } from "./ui/sidebar";
import { Toaster } from "./ui/sonner";

const queryClient = new QueryClient();

export const Providers = (props: {
  children: ReactNode;
  session: Session | null;
  isVerified: boolean;
}) => {
  const navbarRef = useRef<HTMLElement>(null);

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider session={props.session}>
        <ThemeProvider defaultTheme="dark">
          <LetterBackground>
            <TurnstileVerifier isVerified={props.isVerified}>
              <SidebarProvider>
                <AppSidebar />
                <main className="relative flex min-h-[100svh] w-full flex-col items-center overflow-x-hidden">
                  <nav
                    ref={navbarRef}
                    className="bg-secondary sticky top-0 flex w-full items-center justify-between p-2 outline-1"
                  >
                    <SidebarTrigger />
                    <AuthButton />
                  </nav>
                  {props.children}
                </main>
              </SidebarProvider>
              <Toaster />
            </TurnstileVerifier>
          </LetterBackground>
        </ThemeProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
};
