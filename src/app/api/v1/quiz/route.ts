import { NextResponse, type NextRequest } from "next/server";
import { and, eq } from "drizzle-orm";

import { quizInputSchema } from "~/lib/zod/quiz.zod";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { quizModel } from "~/server/db/schema";
import type { QuizDataPOST } from "~/types/api.types";

export async function POST(
  req: NextRequest,
): Promise<NextResponse<QuizDataPOST>> {
  const userId = (await auth())?.userId;

  const jsonBody = await req.json();
  const parsedResult = quizInputSchema.safeParse(jsonBody);

  if (!parsedResult.success) {
    return NextResponse.json(
      {
        message: "phrase is required",
        ok: false,
      },
      { status: 400 },
    );
  }

  const { phrase } = parsedResult.data;

  const conditions = [];
  conditions.push(eq(quizModel.phrase, phrase));
  if (userId) {
    conditions.push(eq(quizModel.userId, userId));
  }

  // Check if quiz already exists for the user with the same phrase
  const [existingQuiz] = await db
    .select({ id: quizModel.id })
    .from(quizModel)
    .where(and(...conditions))
    .limit(1);

  if (existingQuiz) {
    return NextResponse.json({
      message: "Quiz already exists",
      output: { id: existingQuiz.id },
      ok: true,
    });
  }

  const [quiz] = await db
    .insert(quizModel)
    .values({
      userId,
      phrase,
    })
    .returning({ id: quizModel.id });

  if (!quiz) {
    throw new Error("Quiz creation failed");
  }

  return NextResponse.json({
    message: "Quiz created successfully",
    output: { id: quiz.id },
    ok: true,
  });
}
