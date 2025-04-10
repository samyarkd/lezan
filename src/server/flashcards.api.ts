import { zValidator } from "@hono/zod-validator";
import { and, eq } from "drizzle-orm";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";

import { generateFlashcards } from "~/lib/ai/flashcards.ai";
import {
  flashcardsInputSchema,
  flashcardsOutputSchema,
  getFlashcardsParams,
} from "~/lib/zod/flashcards.zod";
import { auth } from "./auth";
import { db } from "./db";
import { flashcardsModel } from "./db/schema";

/*
 * Flashcards API
 *
 * 💬 Routes:
 * - POST /flashcards (public)
 * - GET /flashcards (public)
 * - GET /flashcards/history (protected)
 */
export const flashcardsApi = new Hono()
  .basePath("/flashcards")
  .post("/", zValidator("json", flashcardsInputSchema), async (c) => {
    const parsedInput = c.req.valid("json");
    const userId = (await auth())?.userId;

    // -----------------------------------
    // CHECK IF A RESPONSE ALREADY EXISTS
    // -----------------------------------
    let cachedRes = (
      await db
        .select()
        .from(flashcardsModel)
        .where(eq(flashcardsModel.phrase, parsedInput.phrase))
        .execute()
    ).pop();

    if (cachedRes) {
      // Parse the existing data using Zod schema
      const parsedCachedData = flashcardsOutputSchema.safeParse(cachedRes.data);
      if (!parsedCachedData.success) {
        throw new HTTPException(500, { message: "INVALID_CACHED_DATA" });
      }

      if (cachedRes.userId !== userId) {
        // Find if the current user already has the flashcard, otherwise create a duplicate
        let userFlashcard = (
          await db
            .select()
            .from(flashcardsModel)
            .where(
              and(
                eq(flashcardsModel.phrase, parsedInput.phrase),
                eq(flashcardsModel.userId, userId ?? ""),
              ),
            )
            .execute()
        ).pop();

        userFlashcard = (
          await db
            .insert(flashcardsModel)
            .values({
              userId: userId ?? "",
              phrase: parsedInput.phrase,
              data: parsedCachedData.data,
            })
            .returning()
            .execute()
        ).pop();

        cachedRes = userFlashcard;
      }

      if (!cachedRes) {
        throw new HTTPException(404, { message: "Flashcard not found" });
      }

      // Return the parsed data
      return c.json({ id: cachedRes.id });
    }

    // -----------------------------------
    // GENERATE FLASHCARDS WITH OPENAI
    // -----------------------------------
    const generatedFlashcards = await generateFlashcards(parsedInput.phrase);

    // -----------------------------------
    // PARSE THE OUTPUT FROM OPENAI
    // -----------------------------------
    const parsedOutput = flashcardsOutputSchema.safeParse(
      JSON.parse(responseContent),
    );
    if (!parsedOutput.success) {
      throw new HTTPException(500, {
        message: "INVALID RESPONSE_P",
      });
    }

    const flashcards = await prisma.flashcards.create({
      select: {
        id: true,
      },
      data: {
        data: parsedOutput.data,
        userId,
        phrase: parsedInput.phrase,
      },
    });

    return c.json({
      id: flashcards.id,
    });
  })
  .get("/", zValidator("query", getFlashcardsParams), async (c) => {
    const params = c.req.valid("query");
    const flashcardId = params.flashcards_id;
    const userId = c.get("authUser")?.user?.id;

    const prisma = getPrisma(c.env.DB, c.env.NODE_ENV);

    try {
      // Fetch the flashcard by ID and ensure it belongs to the authenticated user
      const flashcard = await prisma.flashcards.findUnique({
        where: {
          id: flashcardId,
        },
      });

      if (!flashcard) {
        throw new HTTPException(404, { message: "Flashcard not found" });
      }

      if (flashcard.userId !== userId) {
        throw new HTTPException(403, {
          message: "Unauthorized access to flashcard",
        });
      }

      // Parse the flashcard data using Zod schema
      const parsedFlashcard = flashcardsOutputSchema.safeParse(flashcard.data);
      if (!parsedFlashcard.success) {
        throw new HTTPException(500, { message: "INVALID_FLASHCARD_DATA" });
      }

      // Return the parsed flashcard data
      return c.json({
        id: flashcard.id,
        phrase: flashcard.phrase,
        ...parsedFlashcard.data,
      });
    } catch (error) {
      if (error instanceof HTTPException) {
        throw error;
      }
      if (error instanceof z.ZodError) {
        throw new HTTPException(400, { message: "INVALID_INPUT_DATA" });
      }
      throw new HTTPException(500, { message: "SERVER_ERROR" });
    }
  })
  .get("/history", verifyAuth(), async (c) => {
    const userId = c.get("authUser").user?.id;
    if (!userId) {
      throw new HTTPException(401, { message: "unauthenticated" });
    }
    const prisma = getPrisma(c.env.DB, c.env.NODE_ENV);
    const flashcards = await prisma.flashcards.findMany({
      where: { userId },
      orderBy: { id: "desc" },
      take: 50,
      select: { id: true, phrase: true },
    });
    const response = flashcards.map((f) => ({ id: f.id, title: f.phrase }));
    return c.json(response);
  });
