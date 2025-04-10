import { NextResponse, type NextRequest } from "next/server";
import { desc, eq } from "drizzle-orm";

import { flashcardsInputSchema } from "~/lib/zod/flashcards.zod";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { flashcardsModel } from "~/server/db/schema";
import type { FlashcardDataPOST, FlashcardHistory } from "~/types/api.types";

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

export async function GET(
  _req: NextRequest,
): Promise<NextResponse<FlashcardHistory>> {
  const userId = (await auth())?.userId;
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const flashcards = await db
    .select({ id: flashcardsModel.id, phrase: flashcardsModel.phrase })
    .from(flashcardsModel)
    .where(eq(flashcardsModel.userId, userId))
    .orderBy(desc(flashcardsModel.createdAt))
    .limit(10);

  return NextResponse.json({ message: "success", output: flashcards });
}
