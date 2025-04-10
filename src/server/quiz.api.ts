import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";

import {
  getQuizParams,
  quizInputSchema,
  quizOutputSchema,
} from "~/lib/zod/quiz.zod";

import type { HonoEnv } from "./[[route]]";
import { generateQuiz } from "./ai/quiz.ai";
import { getPrisma } from "./db.server";

/**
 * Quiz API
 *
 * 💬 Routes:
 * - POST /quiz (public)
 * - GET /quiz (public)
 */
export const quizApi = new Hono<HonoEnv>()
  .post("/quiz", zValidator("json", quizInputSchema), async (c) => {
    const parsedData = c.req.valid("json");
    const userId = c.get("authUser")?.user?.id;

    const prisma = getPrisma(c.env.DB, c.env.NODE_ENV);
    // -----------------------------------
    // CHECK IF A RESPONSE ALREADY EXISTS
    // -----------------------------------
    let cachedRes = await prisma.quiz.findUnique({
      where: {
        phrase: parsedData.phrase,
      },
    });

    if (cachedRes) {
      // Parse the existing data using Zod schema
      const parsedCachedData = quizOutputSchema.safeParse(cachedRes.data);
      if (!parsedCachedData.success) {
        throw new HTTPException(500, { message: "INVALID_CACHED_DATA" });
      }

      if (cachedRes.userId !== userId) {
        cachedRes = await prisma.quiz.upsert({
          where: {
            phrase: parsedData.phrase,
            userId: userId || null,
          },
          update: {},
          create: {
            userId: userId || null,
            phrase: parsedData.phrase,
            data: parsedCachedData.data,
          },
        });
      }

      // Return the parsed data
      return c.json({ id: cachedRes.id });
    }

    // -----------------------------------
    // GENERATE QUIZ WITH OPENAI
    // -----------------------------------
    const generatedQuiz = await generateQuiz(parsedData.phrase, c.env);
    const responseContent = generatedQuiz.choices[0].message.content;
    if (!responseContent) {
      throw new HTTPException(500, {
        message: "NO_RESPONSE_Q",
      });
    }

    // -----------------------------------
    // PARSE THE OUTPUT FROM OPENAI
    // -----------------------------------
    const parsedOutput = quizOutputSchema.safeParse(
      JSON.parse(responseContent),
    );
    if (!parsedOutput.success) {
      throw new HTTPException(500, {
        message: "INVALID RESPONSE_Q",
      });
    }

    const quiz = await prisma.quiz.create({
      select: {
        id: true,
      },
      data: {
        data: parsedOutput.data,
        userId,
        phrase: parsedData.phrase,
      },
    });

    return c.json({
      id: quiz.id,
    });
  })
  .get("/quiz", zValidator("query", getQuizParams), async (c) => {
    const params = c.req.valid("query");
    const quizId = params.quiz_id;
    const userId = c.get("authUser")?.user?.id;

    const prisma = getPrisma(c.env.DB, c.env.NODE_ENV);

    try {
      const quiz = await prisma.quiz.findUnique({
        where: { id: quizId },
      });

      if (!quiz) {
        throw new HTTPException(404, { message: "Quiz not found" });
      }

      if (quiz.userId !== userId) {
        throw new HTTPException(403, {
          message: "Unauthorized access to quiz",
        });
      }

      const parsedQuiz = quizOutputSchema.safeParse(quiz.data);
      if (!parsedQuiz.success) {
        throw new HTTPException(500, { message: "INVALID_QUIZ_DATA" });
      }

      return c.json({
        id: quiz.id,
        phrase: quiz.phrase,
        ...parsedQuiz.data,
      });
    } catch (error) {
      if (error instanceof HTTPException) {
        throw error;
      }
      if (error instanceof z.ZodError) {
        throw new HTTPException(400, { message: "INVALID_INPUT_DATA" });
      }
      throw new HTTPException(500, { message: "SERVER_ERROR" });
    }
  });
