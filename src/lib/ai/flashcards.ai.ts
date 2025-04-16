import { streamObject } from "ai";
import { and, eq } from "drizzle-orm";

import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { flashcardsModel } from "~/server/db/schema";
import { flashcardsOutputSchema } from "../zod/flashcards.zod";
import { openaiSDK } from "./openai.ai";

export async function generateFlashcards(phrase: string, f_id: string) {
  const userId = (await auth())?.userId;

  const prompt = `You are an expert language teacher with deep insights into language instruction. Your task is to create flashcards for the phrase provided, where each flashcard shows a word and its translation. Phrase: ${phrase}
  
  Instructions:
1. Only respond in with basic level English.
2. If the prompt is in English provide flashcards with explanation in basic English to learn that English phrase.
  `;

  const response = streamObject({
    model: openaiSDK("o4-mini", { reasoningEffort: "low" }),
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
          phrase,
        })
        .where(and(...conditions))
        .execute();
    },
  });

  return response;
}
