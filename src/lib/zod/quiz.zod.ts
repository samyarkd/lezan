import { z } from "zod";

export const quizInputSchema = z.object({
  phrase: z
    .string({ required_error: "A phrase is required to generatez" })
    .transform((p) => p.trim()),
});

export const quizOutputSchema = z.object({
  questions: z.array(
    z.object({
      question: z.string(),
      options: z.array(z.string()),
      correct_answer_index: z.number(),
    }),
  ),
});

export const getQuizParams = z.object({
  quiz_id: z.string().cuid(),
});

export type QuizApiInput = z.infer<typeof quizInputSchema>;
