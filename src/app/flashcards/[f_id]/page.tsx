"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAnimate } from "motion/react";

import AnimatedSticker from "~/components/animated-stickers";
import Typography from "~/components/typography";
import { Button } from "~/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "~/components/ui/carousel";
import { useCreateQuiz, useGetFlashcard } from "~/hooks/api.hooks";
import { cn } from "~/lib/utils";
import { error_codes, type ERROR_TYPES } from "~/types/api.types";
import { Flashcard } from "./flashcard";

const Flashcards = () => {
  // PARAMS
  const { f_id } = useParams<{ f_id: string }>();

  // API HOOKS
  const flashcardsQuery = useGetFlashcard(f_id);
  const generateQuiz = useCreateQuiz();

  // STATE HOOKS
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [canScrollNext, setCanScrollNext] = useState(false); // Initial false is safer
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [scope, animate] = useAnimate();

  // OTHERS
  const router = useRouter();

  const flashcards = flashcardsQuery.object;
  const flashcardsItems = flashcards?.items;
  const isLastCard = current === (flashcardsItems?.length ?? 0);

  const errorCode: ERROR_TYPES = useMemo(() => {
    try {
      if (flashcardsQuery.error) {
        const parsed = JSON.parse(flashcardsQuery.error.message);
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
  }, [flashcardsQuery.error]);

  useEffect(() => {
    if (errorCode === "NOT_FOUND") {
      router.push("/");
    }
  }, [errorCode]);

  useEffect(() => {
    if (flashcardsQuery.isLoading || !scope.current) {
      return;
    }

    const newLeft = `${(current * 100) / (flashcardsItems?.length ?? 1)}%`;

    animate(
      scope.current,
      { left: newLeft },
      {
        type: "tween",
        duration: 1,

        onComplete: () => {
          setIsMoving(false);
        },
        onPlay: () => {
          setIsMoving(true);
        },
      },
    );
  }, [current]);

  useEffect(() => {
    flashcardsQuery.submit({ flashcards_id: f_id });
  }, []);

  useEffect(() => {
    if (!api) {
      return;
    }

    const updateStates = () => {
      setCurrent(api.selectedScrollSnap() + 1);
      setCanScrollNext(api.canScrollNext());
      setCanScrollPrev(api.canScrollPrev());
    };

    // Set initial states
    updateStates();

    // Update states on selection change
    api.on("select", updateStates);

    // Cleanup event listener
    return () => {
      api.off("select", updateStates);
    };
  }, [api, !flashcardsQuery.error, flashcardsItems?.length]);

  async function handleGoToQuiz() {
    if (flashcards?.phrase) {
      await generateQuiz.mutateAsync({
        phrase: flashcards.phrase,
      });
    }
  }

  if (flashcardsQuery.isLoading || !flashcardsQuery.object) {
    return (
      <AnimatedSticker
        title="Fetching"
        desc="Hold on a second, loading the data"
        data={{
          src: "/ass/running_dog.json",
        }}
      />
    );
  }

  if (generateQuiz?.status === "pending") {
    return (
      <AnimatedSticker
        title="Gnerating a quiz..."
        desc="Hang tight! We're creating your quiz..."
        data={{
          src: "/ass/mathing.json",
        }}
      />
    );
  }

  return (
    <div className="isolate my-auto flex w-full max-w-2xl flex-col justify-center gap-4 px-4 pt-4">
      <Carousel setApi={setApi} className="relative w-full max-w-2xl">
        <CarouselContent>
          {!flashcardsQuery.error &&
            flashcardsItems
              ?.filter((v) => !!v)
              ?.map((i, idx) => (
                <CarouselItem key={idx}>
                  <Flashcard content={i} flashcardId={f_id} />
                </CarouselItem>
              ))}
        </CarouselContent>
      </Carousel>
      <div className="mb-32 flex flex-col gap-4 text-center">
        <Typography className="text-center" variant="muted">
          Click to flip
        </Typography>
        <div className="flex flex-wrap justify-between">
          <Button
            variant="secondary"
            disabled={!canScrollPrev}
            onClick={() => api?.scrollPrev()}
            className="z-100 basis-0.5"
          >
            Prev
          </Button>
          <Button
            disabled={!canScrollNext}
            onClick={() => api?.scrollNext()}
            className="z-100 basis-0.5"
          >
            Next
          </Button>
        </div>
        <Button
          variant={isLastCard ? "default" : "ghost"}
          onClick={handleGoToQuiz}
          className={cn("z-100 w-full", !isLastCard && "underline")}
        >
          {isLastCard ? "Go" : "Skip"} to Quiz
        </Button>
      </div>
      <div
        className="absolute bottom-4"
        style={{ left: "0%", transform: "translateX(-74%)" }}
        ref={scope}
      >
        {(isMoving || !isLastCard) && (
          <AnimatedSticker responsive data={{ src: "/ass/sleepy_dog.json" }} />
        )}
        {!isMoving && isLastCard && (
          <AnimatedSticker
            responsive
            flipH
            data={{ src: "/ass/waving_dog.json" }}
          />
        )}
      </div>
    </div>
  );
};

export default Flashcards;
