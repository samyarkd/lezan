import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";

import { generateAndUploadAudio } from "~/lib/ai/audio.ai";
import { audioQuerySchema } from "~/lib/zod/audio.zod";
import { db } from "~/server/db";
import { flashcardsModel } from "~/server/db/schema";
import type { GetAudioResponse } from "~/types/api.types";

export async function GET(
  req: NextRequest,
): Promise<NextResponse<GetAudioResponse>> {
  let queryParams;

  try {
    queryParams = audioQuerySchema.parse(
      Object.fromEntries(req.nextUrl.searchParams.entries()),
    );
  } catch (err) {
    console.log("ERROR_AUDIO", err);

    return NextResponse.json(
      { ok: false, message: "Invalid query parameters" },
      { status: 400 },
    );
  }

  const { flashcardId, word, speed } = queryParams;

  const [flashcard] = await db
    .select()
    .from(flashcardsModel)
    .where(eq(flashcardsModel.id, flashcardId.toString()))
    .execute();

  if (!flashcard) {
    return NextResponse.json(
      { ok: false, message: "Flashcard not found" },
      { status: 404 },
    );
  }

  const formattedWord = word.toString().toLowerCase().trim();
  if (!flashcard.phrase.toLowerCase().trim().includes(formattedWord)) {
    return NextResponse.json(
      { ok: false, message: "Word is not part of the flashcard phrase" },
      { status: 400 },
    );
  }

  const audioResponse = await generateAndUploadAudio(word.toString(), speed);
  const arrayBuf = await audioResponse.audioResult.arrayBuffer();
  const buffer = Buffer.from(arrayBuf);
  const base64 = buffer.toString("base64");

  return NextResponse.json(
    {
      ok: true,
      message: "Audio generated successfully",
      output: base64,
    },
    {
      status: 200,
    },
  );
}
