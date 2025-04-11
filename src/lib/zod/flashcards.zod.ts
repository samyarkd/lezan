import { z } from "zod";

export const flashcardsInputSchema = z.object({
  phrase: z
    .string({ required_error: "A phrase is required to generate flashcards" })
    .transform((p) => p.trim()),
});

export const flashcardsOutputSchema = z.object({
  name: z.string(),
  phrase: z.string().describe("the exact phrase that user is trying to learn"),
  items: z.array(
    z
      .object({
        note: z
          .string()
          .describe(
            "Any additional notes or tips. if the word is written in any writing system beside english write the pronunciation in english letters it should only pronunciation of the word nothing extra.",
          ),
        translation: z.string().describe("translation of the word"),
        word: z
          .string()
          .describe("word in the phrase that user wants to learn"),
      })
      .strict(),
  ),
});

export const getFlashcardsParams = z.object({
  flashcards_id: z.string().cuid(),
});

export type FlashcardsApiInput = z.infer<typeof flashcardsInputSchema>;
