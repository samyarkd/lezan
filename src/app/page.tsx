"use client";

import AnimatedSticker from "~/components/animated-stickers";
import { useGetFlashcardsState } from "~/hooks/api.hooks";
import { CarouselSection } from "./carousel-guide";
import { PhraseInput } from "./phrase-input";

const HomePage = () => {
  const genFlashcardsState = useGetFlashcardsState();

  if (genFlashcardsState[0]?.status === "pending") {
    return (
      <AnimatedSticker
        title="Cooking your phrase..."
        desc="Loading flashcards generated from your input phrase"
        data={{
          src: "/ass/flashcards.json",
        }}
      />
    );
  }

  return (
    <>
      <CarouselSection />
      <PhraseInput />
    </>
  );
};

export default HomePage;
