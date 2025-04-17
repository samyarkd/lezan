import { useState } from "react";
import { useRouter } from "next/navigation";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import {
  useMutation,
  useMutationState,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

import { ClientError, sendApiRequest } from "~/lib/api.utils";
import { base64ToArrayBuffer } from "~/lib/utils";
import {
  flashcardsInputSchema,
  flashcardsOutputSchema,
  type FlashcardsApiInput,
} from "~/lib/zod/flashcards.zod";
import {
  quizInputSchema,
  quizOutputSchema,
  type QuizApiInput,
} from "~/lib/zod/quiz.zod";
import type {
  FlashcardDataPOST,
  FlashcardHistory,
  GetAudioResponse,
  QuizDataPOST,
  ResponseData,
} from "~/types/api.types";
import type { FlashcardAiResult } from "~/types/flashcards.types";

// Initialize Hono client

// ------------------------------
// Quiz API Hook
// ------------------------------

export const useCreateQuiz = () => {
  const router = useRouter();
  return useMutation({
    mutationKey: ["gen-quiz"],
    mutationFn: async (input: QuizApiInput) => {
      // Parse input using Zod schema
      const parsedInput = await quizInputSchema.parseAsync(input);
      // Make API request
      return await sendApiRequest<QuizDataPOST>("/quiz", {
        body: parsedInput,
        method: "POST",
      });
    },
    onError: (err) => {
      if (err instanceof ClientError) {
        console.error(err.message);
        toast.error(err.message);
      }
      if (err instanceof Error) {
        console.error(err.message);
        toast.error(err.message);
      }
      throw err;
    },
    onSuccess: (res) => {
      if (res.ok) {
        router.push(`/quiz/${res.output.id}`);
      }
    },
  });
};

export const useGetQuiz = (quizId: string) => {
  return useObject({
    api: `/api/v1/quiz/${quizId}`,
    schema: quizOutputSchema,
  });
};

// ------------------------------
// Flashcards API Hook
// ------------------------------

export const useCreateFlashcard = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["gen-flashcards"],
    mutationFn: async (input: FlashcardsApiInput) => {
      // Parse input using Zod schema
      const parsedInput = await flashcardsInputSchema.parseAsync(input);
      // Make API request
      return await sendApiRequest<FlashcardDataPOST>("/flashcards", {
        method: "POST",
        body: parsedInput,
      });
    },
    onError: (err) => {
      if (err instanceof ClientError) {
        console.error(err.message);
        toast.error(err.message);
      }
      if (err instanceof Error) {
        console.error(err.message);
        toast.error(err.message);
      }
      throw err;
    },
    onSuccess: (res) => {
      if (res.ok) {
        router.push(`/flashcards/${res.output.id}`);
      }
      void queryClient.invalidateQueries({
        exact: true,
        queryKey: ["get-flashcards-history"],
      });
    },
  });
};

export const useGetFlashcardsState = () =>
  useMutationState({
    filters: {
      mutationKey: ["gen-flashcards"],
    },
    select: (mutation) => mutation.state,
  });

/**
 * Retrieves a flashcard by its unique identifier.
 *
 * This hook utilizes the useObject function to fetch data from the API endpoint:
 * `/api/v1/flashcards/{flashcardId}`, validating the response against the defined
 * flashcardsOutputSchema.
 *
 * @param flashcardId - The unique identifier of the flashcard to be retrieved.
 * @returns An object managed by useObject containing the flashcard data, along with its
 *          loading and error states as applicable.
 *
 * @example
 * // Usage example:
 * const flashcardData = useGetFlashcard("abc123");
 */
export const useGetFlashcard = (flashcardId: string) => {
  return useObject({
    api: `/api/v1/flashcards/${flashcardId}`,
    schema: flashcardsOutputSchema,
  });
};

/**
 * @function useGetFlashcardsHistory
 * @description This hook is used to fetch the flashcards history.
 */
export const useGetFlashcardsHistory = () => {
  const authedUser = useSession();
  return useQuery({
    queryKey: ["get-flashcards-history"],
    enabled: authedUser.status === "authenticated",
    queryFn: async () => {
      try {
        return await sendApiRequest<FlashcardHistory>("/flashcards", {
          method: "GET",
        });
      } catch (err) {
        if (err instanceof ClientError) {
          console.error(err.message);
          toast.error(err.message);
        }
        if (err instanceof Error) {
          console.error(err.message);
          toast.error(err.message);
        }
        throw err;
      }
    },
  });
};

/**
 * @function useGetRandomFlashcards
 * @description Fetches a random selection of flashcards for review.
 */
export const useGetRandomFlashcards = () => {
  const authedUser = useSession();
  return useQuery({
    queryKey: ["get-random-flashcards"],
    enabled: authedUser.status === "authenticated",
    queryFn: async (): Promise<ResponseData<FlashcardAiResult>> => {
      try {
        return await sendApiRequest<ResponseData<FlashcardAiResult>>( "/flashcards/random", { method: "GET" });
      } catch (err) {
        if (err instanceof ClientError) {
          console.error(err.message);
          toast.error(err.message);
        }
        if (err instanceof Error) {
          console.error(err.message);
          toast.error(err.message);
        }
        throw err;
      }
    },
  });
};

/**
 * useGenAudio is a hook to generate audio for a given flashcard word.
 */
export const useGenAudio = () => {
  const [speed, setSpeed] = useState<"normal" | "slow">("normal");
  return useMutation({
    gcTime: Infinity,
    mutationKey: ["gen-audio", speed],
    mutationFn: async (params: { flashcardId: string; word: string }) => {
      const response = await sendApiRequest<GetAudioResponse>("/audio", {
        method: "GET",
        params: { flashcardId: params.flashcardId, word: params.word, speed },
      });
      if (response.ok) {
        const buffer = base64ToArrayBuffer(response.output);
        return new Blob([buffer], { type: "audio/mpeg" });
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
    onSuccess: () => {
      // Switch between "normal" and "slow" speed after each successful audio generation
      setSpeed((prev) => (prev === "normal" ? "slow" : "normal"));
    },
  });
};

// ------------------------------
// Turnstile Verification Hook
// ------------------------------

export const useVerifyTurnstile = () => {
  return useMutation({
    mutationKey: ["verify-turnstile"],
    mutationFn: async (token: string) => {
      const res = await fetch("/api/verify-turnstile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (!res.ok) {
        throw new Error("Verification failed");
      }
    },
    onError: (error) => {
      toast.error(error?.message ?? "Turnstile verification failed");
    },
  });
};
