// ----------------------------- //
//        Flashcards Type        //

import type { FlashcardAiResult } from "./flashcards.types";
import type { QuizAiResult } from "./quiz.types";

export type ResponseData<T> =
  | { ok: false; message: string }
  | { ok: true; message: string; output: T };

// ----------------------------- //
export type FlashcardDataPOST = ResponseData<{ id: string }>;
export type FlashcardDataGET =
  | ResponseData<FlashcardAiResult>
  | FlashcardAiResult;

export type FlashcardHistory = ResponseData<{ id: string; phrase: string }[]>;

// ----------------------------- //
//            Quiz Type          //
// ----------------------------- //w
export type QuizDataPOST = ResponseData<{ id?: string }>;
export type QuizDataGET = ResponseData<QuizAiResult> | QuizAiResult;

// ----------- Audio Type ------------ //
export type GetAudioResponse = ResponseData<Base64URLString>;
