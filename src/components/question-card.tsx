import { useMemo, useState } from "react";

import { useSetAtom } from "jotai";
import { CheckCircle2, XCircle } from "lucide-react";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "~/components/ui/card";
import { Progress } from "~/components/ui/progress";
import { cn } from "~/lib/utils";
import { isFinishedAtom } from "~/pages/quiz";

interface Question {
  correct_answer_index: number;
  question: string;
  options: string[];
}

interface QuestionCardProps {
  questions: Question[];
  phrase: string;
}

export default function QuestionCard({ questions, phrase }: QuestionCardProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [progress, setProgress] = useState(0);
  const setIsFinished = useSetAtom(isFinishedAtom);

  const currentQuestion = questions[currentQuestionIndex];

  // Add memoized shuffled options for current question
  const shuffledOptions = useMemo(() => {
    return [...currentQuestion.options].sort(() => Math.random() - 0.5);
  }, [currentQuestion]);

  const handleOptionSelect = (option: string) => {
    if (isAnswerChecked) return;
    setSelectedOption(option);
  };

  const checkAnswer = () => {
    if (selectedOption === null) return;

    const selectedOptionData = currentQuestion.options.find(
      (option) => option === selectedOption,
    );

    const correct =
      selectedOptionData ===
        currentQuestion.options[currentQuestion.correct_answer_index] || false;
    setIsCorrect(correct);
    setIsAnswerChecked(true);
    if (!correct) {
      setWrongAnswers((prev) => prev + 1);
    }
  };

  const handleContinue = () => {
    // Calculate new progress
    const newProgress = Math.min(
      100,
      ((currentQuestionIndex + 1) / questions.length) * 100,
    );
    setProgress(newProgress);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
      setIsAnswerChecked(false);
    } else {
      // When questions are finished, set isFinished to true.
      setIsFinished(true);
    }
  };

  const checkCorrect = (option: string) =>
    option === currentQuestion.options[currentQuestion.correct_answer_index];

  return (
    <Card className="w-full shadow-lg sm:min-w-md lg:min-w-4xl m">
      <CardHeader className="border-b pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white">
              {currentQuestionIndex + 1}
            </div>
            <Progress value={progress} className="h-2 w-24" />
          </div>
          <div
            className="flex items-center gap-2"
            title="number of wrong answers"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white">
              <span className="text-xs text-destructive">❗</span>
            </div>
            <span className="text-sm font-medium">{wrongAnswers}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="mb-6 text-center flex flex-col gap-2">
          {/* title */}
          <h2 className="md:text-xl font-bold">{currentQuestion.question}</h2>

          {/* phrase */}
          <div className="text-muted-foreground text-sm">{phrase}</div>
        </div>
        <div className="space-y-3">
          {shuffledOptions.map((option) => (
            <button
              key={option}
              onClick={() => handleOptionSelect(option)}
              className={cn(
                `w-full rounded-xl border-2 p-2 md:p-4 text-left transition-all font-semibold ${
                  selectedOption === option
                    ? isAnswerChecked
                      ? checkCorrect(option)
                        ? "border-primary bg-[#E5F8D3] text-primary"
                        : "border-destructive bg-red-100 text-destructive"
                      : "border-primary"
                    : "border-white/30 hover:border-gray-300"
                }`,
              )}
              disabled={isAnswerChecked}
            >
              <div className="flex items-center justify-between">
                <span>{option}</span>
                {isAnswerChecked && selectedOption === option && (
                  <span>
                    {checkCorrect(option) ? (
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    ) : (
                      <XCircle className="h-5 w-5 text-destructive" />
                    )}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex justify-center border-t pt-4">
        {!isAnswerChecked ? (
          <Button
            onClick={checkAnswer}
            disabled={selectedOption === null}
            className="w-full"
          >
            Check
          </Button>
        ) : (
          <div className="w-full space-y-4">
            <div
              className={`rounded-lg p-3 text-center ${
                isCorrect
                  ? "bg-[#E5F8D3] text-primary"
                  : "bg-red-100 text-destructive"
              }`}
            >
              <p className="font-medium">
                {isCorrect ? "Correct!" : "Incorrect!"}
              </p>
              {!isCorrect && (
                <p className="mt-1 text-sm">
                  The correct answer is:{" "}
                  {currentQuestion.options.find((option) =>
                    checkCorrect(option),
                  )}
                </p>
              )}
            </div>
            <Button className="w-full" onClick={handleContinue}>
              Continue
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
