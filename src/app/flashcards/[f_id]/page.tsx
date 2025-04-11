"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AudioLines, Dot } from "lucide-react";
import { useAnimate } from "motion/react";

import AnimatedSticker from "~/components/animated-stickers";
import Typography from "~/components/typography";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "~/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "~/components/ui/carousel";
import { useGenAudio, useGenQuiz, useGetFlashcard } from "~/hooks/api.hooks";
import { cn } from "~/lib/utils";

function FlashcardsPage() {
  const params = useParams<{ f_id: string }>();
  return <div>hello {params.f_id}</div>;
}

export default FlashcardsPage;

const ReadAudioButton: React.FC<{ flashcardId: string; word: string }> = ({
  flashcardId,
  word,
}) => {
  const { mutateAsync, isPending } = useGenAudio();
  const handlePlay = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const blob = await mutateAsync({ flashcardId, word });
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.play();
    } catch {
      // Error is handled via hook notifications
    }
  };
  return (
    <Button
      variant="ghost"
      onClick={handlePlay}
      className="py-8"
      disabled={isPending}
    >
      <AudioLines className="text-muted-foreground !h-11 !w-11" size={40} />
    </Button>
  );
};

const Flashcard: React.FC<{
  content: {
    note: string;
    word: string;
    translation: string;
  };
  flashcardId: string;
}> = (props) => {
  const { note, word, translation } = props.content;
  const { flashcardId } = props;
  const [flip, setFlip] = useState(true);
  const handleClick = () => setFlip((prev) => !prev);

  return (
    <CarouselItem>
      <div
        className="flex items-center justify-center p-5"
        style={{ perspective: "1000px" }}
      >
        <motion.div
          style={{
            width: "20rem",
            minHeight: "20rem",
            position: "relative",
            transformStyle: "preserve-3d",
          }}
          animate={{ rotateY: flip ? 0 : 180 }}
          transition={{ duration: 0.7 }}
        >
          <Dot
            className="absolute top-0 left-1/2 z-10 -translate-1/2 text-lime-600"
            size={50}
          />
          <div
            className="front"
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              backfaceVisibility: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <Card
              onClick={handleClick}
              className="flex h-full w-full flex-col items-center justify-between text-center"
            >
              <CardHeader>
                <Typography variant="h1">Word</Typography>
              </CardHeader>
              <CardContent>
                <Typography variant="p">{word}</Typography>
              </CardContent>
              <CardFooter>
                <ReadAudioButton flashcardId={flashcardId} word={word} />
              </CardFooter>
            </Card>
          </div>
          <div
            className="back"
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              backfaceVisibility: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: "rotateY(180deg)",
              cursor: "pointer",
            }}
          >
            <Card
              onClick={handleClick}
              className="flex h-full w-full flex-col items-center justify-between text-center"
            >
              <CardHeader>
                <Typography variant="h1">Translation</Typography>
              </CardHeader>
              <CardContent>
                <Typography variant="p">{translation}</Typography>
              </CardContent>
              <CardFooter className="flex flex-col">
                <Typography variant="muted">{note}</Typography>
              </CardFooter>
            </Card>
          </div>
        </motion.div>
      </div>
    </CarouselItem>
  );
};

const Flashcards = () => {
  // REQUIRED AUTHENTICATION
  // useSession({ required: true });

  // PARAMS
  const { flashcards_id } = useParams<{ flashcards_id: string }>();

  // API HOOKS
  const flashcards = useGetFlashcard(flashcards_id);
  const generateQuiz = useGenQuiz();

  // STATE HOOKS
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [canScrollNext, setCanScrollNext] = useState(false); // Initial false is safer
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [scope, animate] = useAnimate();

  // OTHERS
  const navigate = useRouter();

  const isLastCard = current === (flashcards.data?.items.length || 0);

  useEffect(() => {
    if (!flashcards.isSuccess) {
      return;
    }

    const newLeft = `${(current * 100) / (flashcards.data?.items.length || 1)}%`;

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
  }, [api, flashcards.isSuccess, flashcards.data?.items.length]);

  async function handleGoToQuiz() {
    const generatedQuiz = flashcards.data?.phrase
      ? await generateQuiz.mutateAsync({ phrase: flashcards.data.phrase })
      : undefined;

    navigate(`/app/quiz/${generatedQuiz?.id}`);
  }

  if (flashcards.isPending) {
    return (
      <AnimatedSticker
        title="Fetching"
        desc="Hold on a second, loading the data"
        data={{
          raw: RunningDogAss,
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
          raw: MathingAss,
        }}
      />
    );
  }

  return (
    <div className="isolate my-auto flex w-full max-w-2xl flex-col justify-center gap-4 px-4 pt-4">
      <Carousel setApi={setApi} className="relative w-full max-w-2xl">
        <CarouselContent>
          {flashcards.isSuccess &&
            flashcards.data?.items.map((i, idx) => (
              <Flashcard key={idx} content={i} flashcardId={flashcards_id} />
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
          <AnimatedSticker responsive data={{ raw: SleepyDogAss }} />
        )}
        {!isMoving && isLastCard && (
          <AnimatedSticker responsive flipH data={{ raw: WavingDogAss }} />
        )}
      </div>
    </div>
  );
};

export default Flashcards;
