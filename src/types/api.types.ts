// ----------------------------- //
//        Flashcards Type        //

import type { FlashcardAiResult } from "./flashcards.types";
import type { QuizAiResult } from "./quiz.types";

export type ResponseData<T> = { message: string; output?: T };

// ----------------------------- //
export type FlashcardDataPOST = ResponseData<{ id?: string }>;
export type FlashcardDataGET =
  | ResponseData<{
      output?: FlashcardAiResult;
    }>
  | FlashcardAiResult;

export type FlashcardHistory = ResponseData<{ id: string; phrase: string }[]>;

// ----------------------------- //
//            Quiz Type          //
// ----------------------------- //w
export type QuizDataPOST = ResponseData<{ id?: string }>;
export type QuizDataGET =
  | ResponseData<{
      output?: QuizAiResult;
    }>
  | QuizAiResult;
