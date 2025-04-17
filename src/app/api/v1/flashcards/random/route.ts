import { NextResponse, type NextRequest } from "next/server";
import { and, eq, sql } from "drizzle-orm";

import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { flashcardsModel } from "~/server/db/schema";

/**
 * GET /api/v1/flashcards/random
 * Returns a random selection of flashcards for review: selects 10 random flashcard sets
 * and picks one random item from each set.
 */
export async function GET(_req: NextRequest) {
  const userId = (await auth())?.userId;
  if (!userId) {
    return NextResponse.json(
      { ok: false, message: "Unauthorized" },
      { status: 401 },
    );
  }

  // Select 10 random completed flashcard entries for this user
  const rows = await db
    .select({ data: flashcardsModel.data })
    .from(flashcardsModel)
    .where(
      and(
        eq(flashcardsModel.userId, userId),
        eq(flashcardsModel.status, "complete"),
      ),
    )
    .orderBy(sql`random()`)
    .limit(10);

  // Pick one random item from each flashcard set
  const items = rows.flatMap((row) => {
    const arr = row.data.items;
    if (!Array.isArray(arr) || arr.length === 0) {
      return [];
    }
    const idx = Math.floor(Math.random() * arr.length);
    return [arr[idx]];
  });

  const output = {
    name: "random",
    phrase: "random",
    items,
  };

  return NextResponse.json(
    { ok: true, message: "success", output },
    { status: 200 },
  );
}