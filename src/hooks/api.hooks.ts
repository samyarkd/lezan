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
import type {
  FlashcardDataPOST,
  FlashcardHistory,
  GetAudioResponse,
} from "~/types/api.types";

// Initialize Hono client

// ------------------------------
// Quiz API Hook
// ------------------------------

export const useCreateQuiz = () => {
  // return useMutation({
  //   mutationKey: ["gen-quiz"],
  //   mutationFn: async (input: QuizApiInput) => {
  //     try {
  //       // Parse input using Zod schema
  //       const parsedInput = await quizInputSchema.parseAsync(input);
  //       // Make API request
  //       const response = await sendApiRequest('',{
  //         json: parsedInput,
  //       });
  //       // Parse and return response data
  //       return await response.json();
  //     } catch (err) {
  //       if (err instanceof HTTPException) {
  //         console.error(err.message);
  //         toast.error(err.message);
  //       }
  //       if (err instanceof Error) {
  //         console.error(err.message);
  //         toast.error(err.message);
  //       }
  //       throw err;
  //     }
  //   },
  // });
};

export const useGetQuiz = (quizId: string) => {
  // return useQuery({
  //   queryKey: ["get-quiz", quizId],
  //   queryFn: async () => {
  //     try {
  //       const response = await apiClient.quiz.$get({
  //         query: { quiz_id: quizId },
  //       });
  //       const data = await response.json();
  //       return data;
  //     } catch (err) {
  //       if (err instanceof HTTPException) {
  //         console.error(err.message);
  //         toast.error(err.message);
  //       }
  //       if (err instanceof Error) {
  //         console.error(err.message);
  //         toast.error(err.message);
  //       }
  //       throw err;
  //     }
  //   },
  //   enabled: Boolean(quizId),
  // });
};

// ------------------------------
// Flashcards API Hook
// ------------------------------
export const useCreateFlashcard = () => {
  const router = useRouter();

  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["gen-flashcards"],
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
      console.log("res", res);
      if (res.ok) {
        router.push(`/flashcards/${res.output.id}`);
      }

      void queryClient.invalidateQueries({
        exact: true,
        queryKey: ["get-flashcards-history"],
      });
    },
    mutationFn: async (input: FlashcardsApiInput) => {
      // Parse input using Zod schema
      const parsedInput = await flashcardsInputSchema.parseAsync(input);
      // Make API request
      return await sendApiRequest<FlashcardDataPOST>("/flashcards", {
        method: "POST",
        body: parsedInput,
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
      // switch between slow and normal speed
      setSpeed((prev) => (prev === "normal" ? "slow" : "normal"));
    },
  });
};
