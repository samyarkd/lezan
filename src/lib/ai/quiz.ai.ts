import { streamObject } from "ai";
import { and, eq } from "drizzle-orm";

import { quizOutputSchema } from "~/lib/zod/quiz.zod"; // ensure this is defined
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { quizModel } from "~/server/db/schema";
import { openaiSDK } from "./openai.ai";

export async function generateQuiz(phrase: string, q_id: string) {
  const userId = (await auth())?.userId;

  const prompt = `You are an excellent language teacher. You have to create a quiz based on the following phrase: "${phrase}".
  
Instructions:
1. Construct a set of 10 multiple-choice questions.
2. Vary the question types (e.g., translation, fill-in-the-blank, conjugation).
3. For each question provide 3-4 options and indicate the correct answer by its index.
  
Output Format (in JSON):
{
  "questions": [
    {
      "question": "Question text?",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correct_answer_index": 1
    }
    // ... additional questions
  ]
}`;

  const response = streamObject({
    model: openaiSDK("gpt-4-turbo"),
    prompt,
    schema: quizOutputSchema,
    async onFinish(event) {
      const data = event.object;
      const conditions = [];
      conditions.push(eq(quizModel.id, q_id));
      if (userId) {
        conditions.push(eq(quizModel.userId, userId));
      }
      await db
        .update(quizModel)
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
