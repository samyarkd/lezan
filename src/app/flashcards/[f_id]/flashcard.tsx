"use client";

import { useState } from "react";
import { Dot } from "lucide-react";
import { motion } from "motion/react";

import Typography from "~/components/typography";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "~/components/ui/card";
import { ReadWordButton } from "./read-word";

export const Flashcard: React.FC<{
  content: Partial<{
    note: string;
    word: string;
    translation: string;
  }>;
  flashcardId: string;
}> = (props) => {
  const { note, word, translation } = props.content;
  const { flashcardId } = props;
  const [flip, setFlip] = useState(true);
  const handleClick = () => setFlip((prev) => !prev);

  return (
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
              {word && <ReadWordButton flashcardId={flashcardId} word={word} />}
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
  );
};
