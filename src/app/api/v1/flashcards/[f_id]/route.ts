/**
 * Handles GET requests for flashcard data. Generate the flashcard if it was on created status.
 *
 * This endpoint performs the following operations:
 *
 * 1. Parses and validates the incoming JSON body using the Zod schema from `getFlashcardsParams`
 *    to extract the `flashcards_id`.
 *
 * 2. Authenticates the user via the `auth` helper function, and if a user is authenticated,
 *    restricts the query to flashcards that belong to that user.
 *
 * 3. Constructs database query conditions based on the provided `flashcards_id` (and `userId`
 *    when available) to retrieve the appropriate flashcard from the database using Drizzle ORM.
 *
 * 4. Depending on the status of the flashcard it processes the response as follows:
 *    - If the flashcard is marked as "complete" and contains generated data, responds with a
 *      success message and the flashcard data.
 *    - If the flashcard status is "created", it calls `generateFlashcards` to generate the flashcards,
 *      and streams the resulting output back to the client.
 *    - If the flashcard status is "failed", responds with an error message and a 500 status code.
 *    - For any other unhandled flashcard status, responds with an error message and a 400 status code.
 *
 * @async
 * @function GET
 * @param {NextRequest} req - The incoming Next.js request containing the flashcard ID in its JSON body.
 * @returns {Promise<NextResponse<FlashcardDataGET>>} A promise that resolves to a NextResponse containing
 * the flashcard data, or an appropriate error message if validation fails or the flashcard is not found.
 *
 * @throws {400} If the incoming JSON body does not match the expected schema.
 * @throws {404} If no flashcard is found matching the provided conditions.
 * @throws {500} If the flashcard generation has previously failed.
 *
 * @remarks This module uses:
 * - `drizzle-orm` for database operations.
 * - The `auth` function for user authentication.
 * - A Zod schema defined in `getFlashcardsParams` to ensure the integrity of the input data.
 */
import { NextResponse, type NextRequest } from "next/server";
import { and, eq } from "drizzle-orm";

import { generateFlashcards } from "~/lib/ai/flashcards.ai";
import { getFlashcardsParams } from "~/lib/zod/flashcards.zod";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { flashcardsModel } from "~/server/db/schema";
import type { FlashcardDataGET } from "~/types/api.types";
import type { FlashcardAiResult } from "~/types/flashcards.types";

export async function GET(
  req: NextRequest,
): Promise<NextResponse<FlashcardDataGET>> {
  const userId = (await auth())?.userId;

  const jsonBody = await req.json();
  const parsedBody = getFlashcardsParams.safeParse(jsonBody);

  if (!parsedBody.success) {
    return NextResponse.json(
      { message: "Invalid flashcard id" },
      { status: 400 },
    );
  }
  const { flashcards_id } = parsedBody.data;

  const conditions = [];
  conditions.push(eq(flashcardsModel.id, flashcards_id));
  if (userId) {
    conditions.push(eq(flashcardsModel.userId, userId));
  }

  const [flashcard] = await db
    .select()
    .from(flashcardsModel)
    .where(and(...conditions));

  if (!flashcard) {
    return NextResponse.json(
      { message: "Flashcard not found" },
      { status: 404 },
    );
  }

  if (flashcard.status === "complete" && flashcard.data) {
    return NextResponse.json(
      { message: "flashcards generated successfully", output: flashcard.data },
      { status: 200 },
    );
  }

  if (flashcard?.status === "created") {
    const stream = await generateFlashcards(flashcard.phrase, flashcard.id);
    return stream.toTextStreamResponse() as NextResponse<FlashcardAiResult>;
  } else if (flashcard?.status === "failed") {
    return NextResponse.json(
      { message: "Flashcard generation failed" },
      { status: 500 },
    );
  } else {
    return NextResponse.json(
      { message: "Unhandled flashcard status" },
      { status: 400 },
    );
  }
}
