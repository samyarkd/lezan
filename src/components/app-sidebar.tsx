import Link from "next/link";
import { ChevronRight, History } from "lucide-react";
import { useSession } from "next-auth/react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
} from "~/components/ui/sidebar";
import { useGetFlashcardsHistory } from "~/hooks/api.hooks";
import { Button } from "./ui/button";
import VideoDemo from "./video-demo";

export function AppSidebar() {
  const auth = useSession();
  const flashCardsHistory = useGetFlashcardsHistory();

  return (
    <Sidebar className="bg-background">
      <SidebarHeader>
        <Link href={"/"}>
          <span className="font-semibold">Hi {auth.data?.user?.name}</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-4">
            <span>Learning History</span> <History className="mt-px" />
          </SidebarGroupLabel>
          <SidebarContent>
            <Link href="/flashcards/random" className="text-center">
              <Button className="w-full">Review Random Flashcards</Button>
            </Link>
            {flashCardsHistory.data?.ok &&
              flashCardsHistory.data?.output?.map((historyItem) => (
                <Link
                  href={`/flashcards/${historyItem.id}`}
                  key={historyItem.id}
                >
                  <Button
                    variant="outline"
                    className="relative flex w-full items-center justify-between"
                  >
                    <span className="truncate">{historyItem.phrase}</span>
                    <span className="text-primary opacity-0 transition-all hover:opacity-100">
                      <span className="absolute inset-0" />
                      <ChevronRight />
                    </span>
                  </Button>
                </Link>
              ))}

            {flashCardsHistory.isLoading && (
              <div className="text-muted-foreground my-auto flex min-h-96 items-center justify-center text-center">
                Loading...
              </div>
            )}
          </SidebarContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        {/* Demo Video */}
        <VideoDemo />
        {/* new Phrase */}
        <Link href="/" className="text-center">
          <Button className="w-full" size="sm">
            New Phrase/Word
          </Button>
        </Link>
        {/* feedback link https://www.admonymous.co/vajin*/}
        <a
          href="https://www.admonymous.co/vajin"
          target="_blank"
          rel="noreferrer"
          className="text-center"
        >
          <Button variant="link">Submit Feedback</Button>
        </a>
      </SidebarFooter>
    </Sidebar>
  );
}
