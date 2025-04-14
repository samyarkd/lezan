"use client";

import { useEffect, useMemo } from "react";
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

  // QUIZ DATA
  // We are doing this because of typesafety
  const quizParsed = useMemo(() => {
    return quizOutputSchema.safeParse(quizQuery.object);
  }, [quizQuery.isLoading]);

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

  // ---------- USEEFFECTS ------------- //
  useEffect(() => {
    quizQuery.submit({ quiz_id: q_id });

    return () => {
      setIsFinished(false);
    };
  }, []);

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

  if (quizQuery.isLoading || !quizQuery.object) {
    return (
      <AnimatedSticker
        data={{
          src: "/ass/running_dog.json",
        }}
        title="Fetching the Quiz"
        desc="Loading the generated quiz"
      />
    );
  }

  if (!quizParsed.success || quizQuery.error) {
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
