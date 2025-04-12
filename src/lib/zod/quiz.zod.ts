import { z } from "zod";

export const quizInputSchema = z.object({
  phrase: z
    .string({ required_error: "A phrase is required to generatez" })
    .transform((p) => p.trim()),
});

export const quizQuestionSchema = z
  .object({
    question: z.string().describe("the text of the quiz question"),
    options: z
      .array(z.string().describe("a possible answer for the quiz question"))
      .describe("list of potential answers for the question"),
    correct_answer_index: z
      .number()
      .describe("index of the correct answer within the options array"),
  })
  .strict();

export const quizOutputSchema = z.object({
  phrase: z.string().describe("the exact phrase used to generate the quiz"),
  questions: z.array(quizQuestionSchema),
});

export const getQuizParams = z.object({
  quiz_id: z.string().cuid(),
});

export type QuizApiInput = z.infer<typeof quizInputSchema>;
