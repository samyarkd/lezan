import { generateFlashcards } from "~/lib/ai/flashcards.ai";

export async function POST(): Promise<Response> {
  const streamText = generateFlashcards(
    "私 は 毎日 ご飯 を 食べて、元気 に なります",
  );

  return streamText.toTextStreamResponse();
}

export const dynamic = "force-dynamic";
