import type { z } from "zod";

import type { quizOutputSchema } from "~/lib/zod/quiz.zod";

export type QuizAiResult = z.infer<typeof quizOutputSchema>;
