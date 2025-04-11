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
import {
  flashcardsOutputSchema,
  getFlashcardsParams,
} from "~/lib/zod/flashcards.zod";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { flashcardsModel } from "~/server/db/schema";
import type { FlashcardDataGET } from "~/types/api.types";

export async function POST(
  req: NextRequest,
): Promise<FlashcardDataGET | Response> {
  const userId = (await auth())?.userId;

  const jsonBody = await req.json();
  const parsedBody = getFlashcardsParams.safeParse(jsonBody);

  if (!parsedBody.success) {
    return NextResponse.json(
      { ok: false, message: "Invalid flashcard id" },
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
      { ok: false, message: "Flashcard not found", code: "NOT_FOUND" },
      { status: 404 },
    );
  }

  // ------------🟢 COMPLETED 🟢------------- //
  if (flashcard.status === "complete" && flashcard.data) {
    return NextResponse.json(flashcard.data, {
      status: 208,
    });
  }

  // ------------🟡 Pending 🟡------------- //
  if (flashcard?.status === "pending" && flashcard.data) {
    const parsedData = flashcardsOutputSchema.safeParse(flashcard.data);
    if (parsedData.success) {
      // ------------🟢 COMPLETED 🟢------------- //
      await db
        .update(flashcardsModel)
        .set({ status: "complete" })
        .where(eq(flashcardsModel.id, flashcard.id));

      return NextResponse.json(parsedData.data, {
        status: 208,
      });
    } else {
      // ------------🔴 Failed 🔴------------- //
      await db
        .update(flashcardsModel)
        .set({ status: "failed" })
        .where(eq(flashcardsModel.id, flashcard.id));

      return NextResponse.json(
        { ok: false, message: "Invalid flashcard data in pending state" },
        { status: 500 },
      );
    }
  }

  // ------------🔵 Stream 🔵------------- //
  if (flashcard?.status === "created") {
    await db
      .update(flashcardsModel)
      .set({ status: "pending" })
      .where(eq(flashcardsModel.id, flashcard.id));

    const stream = await generateFlashcards(flashcard.phrase, flashcard.id);
    return stream.toTextStreamResponse({
      statusText: "STREAM_STUFF",
    });
  } else if (flashcard?.status === "failed") {
    // ------------🔴 Failed 🔴------------- //
    return NextResponse.json(
      { ok: false, message: "Flashcard generation failed" },
      { status: 500 },
    );
  } else {
    return NextResponse.json(
      { ok: false, message: "Unhandled flashcard status" },
      { status: 400 },
    );
  }
}
