import { streamObject } from "ai";
import { and, eq } from "drizzle-orm";

import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { flashcardsModel } from "~/server/db/schema";
import { flashcardsOutputSchema } from "../zod/flashcards.zod";
import { openaiSDK } from "./openai.ai";

export async function generateFlashcards(phrase: string, f_id: string) {
  const userId = (await auth())?.userId;

  const prompt = `You are an expert language teacher with deep insights into language instruction. Your task is to create flashcards for the phrase provided, where each flashcard shows a word and its translation. Phrase: ${phrase}`;

  const response = streamObject({
    model: openaiSDK("gpt-4-turbo"),
    prompt,
    schema: flashcardsOutputSchema,
    async onFinish(event) {
      const data = event.object;
      const conditions = [];

      conditions.push(eq(flashcardsModel.id, f_id));

      if (userId) {
        conditions.push(eq(flashcardsModel.userId, userId));
      }

      await db
        .update(flashcardsModel)
        .set({
          data,
          userId,
          phrase,
        })
        .where(and(...conditions))
        .execute();
    },
  });

  return response;
}
