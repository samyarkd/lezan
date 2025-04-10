import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { Hono } from "hono";

import { generateAndUploadAudio } from "~/lib/ai/audio.ai";
import { audioQuerySchema } from "~/lib/zod/audio.zod";
import { db } from "./db";
import { flashcardsModel } from "./db/schema";

export const audioApi = new Hono()
  .basePath("/audio")
  .get("/", zValidator("query", audioQuerySchema), async (c) => {
    const { flashcardId, word, speed } = c.req.valid("query");

    const flashcard = (
      await db
        .select()
        .from(flashcardsModel)
        .where(eq(flashcardsModel.id, flashcardId.toString()))
        .execute()
    ).pop();

    if (!flashcard) {
      return c.json({ error: "Flashcard not found" }, 404);
    }

    const formattedWord = word.toString().toLowerCase().trim();

    if (!flashcard.phrase.toLowerCase().trim().includes(formattedWord)) {
      return c.json({ error: "Word is not part of the flashcard phrase" }, 400);
    }

    const audioResponse = await generateAndUploadAudio(word.toString(), speed);
    const arrayBuf = await audioResponse.audioResult.arrayBuffer();

    const buffer = Buffer.from(arrayBuf);

    return c.body(buffer, 200, { "Content-Type": "audio/mpeg" });
  });
