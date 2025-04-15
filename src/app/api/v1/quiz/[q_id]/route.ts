import { NextResponse, type NextRequest } from "next/server";
import { and, eq } from "drizzle-orm";

import { generateQuiz } from "~/lib/ai/quiz.ai";
import { getQuizParams, quizOutputSchema } from "~/lib/zod/quiz.zod";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { quizModel } from "~/server/db/schema";
import type { QuizDataGET } from "~/types/api.types";

export async function POST(
  req: NextRequest,
): Promise<NextResponse<QuizDataGET> | Response> {
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
      { ok: false, message: "Quiz not found", code: "NOT_FOUND" },
      { status: 404 },
    );
  }

  // ------------🟢 COMPLETED 🟢------------- //
  if (quiz.status === "complete" && quiz.data) {
    return NextResponse.json(quiz.data, { status: 200 });
  }

  // ------------🟡 PENDING 🟡------------- //
  if (quiz.status === "pending" && quiz.data) {
    const parsedData = quizOutputSchema.safeParse(quiz.data);
    if (parsedData.success) {
      // ------------🟢 COMPLETED 🟢------------- //
      await db
        .update(quizModel)
        .set({ status: "complete" })
        .where(eq(quizModel.id, quiz.id));

      return NextResponse.json(parsedData.data, {
        status: 208,
      });
    } else {
      // ------------🔴 FAILED 🔴------------- //
      await db
        .update(quizModel)
        .set({ status: "failed" })
        .where(eq(quizModel.id, quiz.id));

      return NextResponse.json(
        { ok: false, message: "Invalid quiz data in pending state" },
        { status: 500 },
      );
    }
  }

  // ------------🔵 STREAMING 🔵------------- //
  if (quiz.status === "created" || quiz.status === "pending") {
    await db
      .update(quizModel)
      .set({ status: "pending" })
      .where(eq(quizModel.id, quiz.id));

    const stream = await generateQuiz(quiz.phrase, quiz.id);
    return stream.toTextStreamResponse();
  }
  // ------------🔴 FAILED 🔴------------- //
  else if (quiz.status === "failed") {
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
