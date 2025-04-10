import { NextResponse, type NextRequest } from "next/server";

import { flashcardsInputSchema } from "~/lib/zod/flashcards.zod";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { flashcardsModel } from "~/server/db/schema";
import type { FlashcardDataPOST } from "~/types/api.types";

export async function POST(
  req: NextRequest,
): Promise<NextResponse<FlashcardDataPOST>> {
  const userId = (await auth())?.userId;

  const jsonBody = await req.json();
  const parsedResult = flashcardsInputSchema.safeParse(jsonBody);

  if (!parsedResult.success) {
    return NextResponse.json(
      {
        message: "phrase is required",
      },
      { status: 400 },
    );
  }

  const { phrase } = parsedResult.data;

  const [flashcard] = await db
    .insert(flashcardsModel)
    .values({
      userId,
      phrase,
    })
    .returning({ id: flashcardsModel.id });

  if (!flashcard) {
    throw new Error("Flashcard creation failed");
  }

  return NextResponse.json({
    message: "Flashcard created successfully",
    id: flashcard.id,
  });
}
