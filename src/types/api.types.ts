// ----------------------------- //
//        Flashcards Type        //

import type { FlashcardAiResult } from "./flashcards.types";
import type { QuizAiResult } from "./quiz.types";

// ----------------------------- //
export type FlashcardDataPOST = { message: string; id?: string };
export type FlashcardDataGET =
  | {
      message: string;
      output?: FlashcardAiResult;
    }
  | FlashcardAiResult;

// ----------------------------- //
//            Quiz Type          //
// ----------------------------- //w
export type QuizDataPOST = { message: string; id?: string };
export type QuizDataGET =
  | {
      message: string;
      output?: QuizAiResult;
    }
  | QuizAiResult;
