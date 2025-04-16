"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAtom } from "jotai";

import AnimatedSticker from "~/components/animated-stickers";
import QuestionCard from "~/components/question-card";
import { Button } from "~/components/ui/button";
import { useGetQuiz } from "~/hooks/api.hooks";
import { isFinishedAtom } from "~/lib/storage/global.atom";
import { quizOutputSchema } from "~/lib/zod/quiz.zod";
import { error_codes, type ERROR_TYPES } from "~/types/api.types";

const QuizPage = () => {
  // REQUIRED AUTHENTICATION
  // useSession({ required: true });

  // PARAMS
  const { q_id } = useParams<{ q_id: string }>();

  // HOOKS
  const [isFinished, setIsFinished] = useAtom(isFinishedAtom);
  const router = useRouter();

  // API HOOKS
  const quizQuery = useGetQuiz(q_id);
  // Track submission state to avoid duplicate requests
  const [submitted, setSubmitted] = useState(false);

  // QUIZ DATA: parse fetched object when it changes
  const quizParsed = useMemo(() => {
    return quizOutputSchema.safeParse(quizQuery.object);
  }, [quizQuery.object?.questions?.length]);

  const errorCode: ERROR_TYPES = useMemo(() => {
    try {
      if (quizQuery.error) {
        const parsed = JSON.parse(quizQuery.error.message);
        const code = parsed.code;

        if (error_codes.includes(code)) {
          return code;
        }

        return "UNKNOWN";
      }
      return;
    } catch (error) {
      return "UNKNOWN";
    }
  }, [quizQuery.error]);

  // ---------- USEEFFECTS: fetch quiz on mount or q_id change ------------- //
  // Submit quiz fetch once, then retry if stopped loading without error but invalid data
  useEffect(() => {
    if (!q_id) return;
    if (!submitted) {
      quizQuery.submit({ quiz_id: q_id });
      setSubmitted(true);
    }
    return () => {
      setIsFinished(false);
    };
  }, [q_id, submitted]);
  useEffect(() => {
    if (
      submitted &&
      !quizQuery.isLoading &&
      !quizQuery.error &&
      !quizParsed.success
    ) {
      quizQuery.submit({ quiz_id: q_id });
    }
  }, [submitted, quizQuery.isLoading, quizQuery.error, quizParsed.success, q_id]);

  useEffect(() => {
    if (errorCode === "NOT_FOUND") {
      router.push("/");
    }
  }, [errorCode]);

  useEffect(() => {
    if (!quizQuery.isLoading && quizQuery.error && !quizParsed.success) {
      router.push("/");
    }
  }, [quizQuery.isLoading, quizParsed.success]);

  // While loading or data not yet parsed into a valid quiz, show loader
  if (quizQuery.isLoading || !quizParsed.success) {
    return (
      <AnimatedSticker
        data={{ src: "/ass/running_dog.json" }}
        title="Fetching the Quiz"
        desc="Loading the generated quiz"
      />
    );
  }

  // On error after loading, bail out (redirects handled in effects)
  if (quizQuery.error) {
    return null;
  }

  const quiz = quizParsed.data;

  return (
    <div className="my-auto max-w-3xl p-4">
      {!isFinished && (
        <QuestionCard phrase={quiz?.phrase} questions={quiz.questions} />
      )}
      {isFinished && (
        <div className="flex flex-col items-center justify-center gap-4">
          <AnimatedSticker
            title="Great Job!"
            desc="You've completed the quiz successfully. Check your results and keep improving!"
            data={{
              src: "/ass/party.json",
            }}
          />
          <Button className="mx-auto w-full" onClick={() => router.push("/")}>
            New Phrase/Word
          </Button>
          <Button
            className="mx-auto w-full"
            variant="secondary"
            onClick={() => setIsFinished(false)}
          >
            Retry
          </Button>
        </div>
      )}
    </div>
  );
};
export default QuizPage;
