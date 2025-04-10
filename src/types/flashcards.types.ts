import type { z } from "zod";

import type { flashcardsOutputSchema } from "~/lib/zod/flashcards.zod";

export type FlashcardAiResult = z.infer<typeof flashcardsOutputSchema>;
