import { NextResponse, type NextRequest } from "next/server";
import { and, eq } from "drizzle-orm";

import { generateQuiz } from "~/lib/ai/quiz.ai";
import { getQuizParams } from "~/lib/zod/quiz.zod";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { quizModel } from "~/server/db/schema";
import type { QuizDataGET } from "~/types/api.types";
import type { QuizAiResult } from "~/types/quiz.types";

export async function GET(
  req: NextRequest,
): Promise<NextResponse<QuizDataGET>> {
  const userId = (await auth())?.userId;

  const jsonBody = await req.json();
  const parsedBody = getQuizParams.safeParse(jsonBody);

  if (!parsedBody.success) {
    return NextResponse.json(
      { ok: false, message: "Invalid quiz id" },
      { status: 400 },
    );
  }
  const { quiz_id } = parsedBody.data;

  const conditions = [];
  conditions.push(eq(quizModel.id, quiz_id));
  if (userId) {
    conditions.push(eq(quizModel.userId, userId));
  }

  const [quiz] = await db
    .select()
    .from(quizModel)
    .where(and(...conditions));

  if (!quiz) {
    return NextResponse.json(
      { ok: false, message: "Quiz not found" },
      { status: 404 },
    );
  }

  if (quiz.status === "complete" && quiz.data) {
    return NextResponse.json(
      { ok: true, message: "Quiz generated successfully", output: quiz.data },
      { status: 200 },
    );
  }

  if (quiz.status === "created") {
    const stream = await generateQuiz(quiz.phrase, quiz.id);
    return stream.toTextStreamResponse() as NextResponse<QuizAiResult>;
  } else if (quiz.status === "failed") {
    return NextResponse.json(
      { ok: false, message: "Quiz generation failed" },
      { status: 500 },
    );
  } else {
    return NextResponse.json(
      { ok: false, message: "Unhandled quiz status" },
      { status: 400 },
    );
  }
}
