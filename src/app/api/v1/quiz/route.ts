import { NextResponse, type NextRequest } from "next/server";

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
      },
      { status: 400 },
    );
  }

  const { phrase } = parsedResult.data;

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
    id: quiz.id,
  });
}
