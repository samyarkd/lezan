import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import Typography from "~/components/typography";
import { Button } from "~/components/ui/button";
import { useCreateFlashcard } from "~/hooks/api.hooks";

export const PhraseInput = () => {
  const [isTyping, setIsTyping] = useState(false);
  const [draft, setDraft] = useState("");
  const textRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const genFlashcards = useCreateFlashcard();
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem("draftPhrase") ?? "";
    setDraft(saved);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "/") {
        event.preventDefault();
        if (document.activeElement === textRef.current) {
          textRef.current?.blur();
        } else {
          textRef.current?.focus();
        }
      }

      if (
        document.activeElement === textRef.current &&
        event.ctrlKey &&
        event.key === "Enter"
      ) {
        event.preventDefault();
        formRef.current?.requestSubmit();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const phrase = formData.get("phrase") as string;

    genFlashcards
      .mutateAsync({
        phrase,
      })
      .then((res) => {
        if (res.output?.id) {
          router.push(`/app/flashcards/${res.output.id}`);
        }
      });
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setDraft(value);
    localStorage.setItem("draftPhrase", value);
  };

  return (
    <div className="mt-auto w-full max-w-2xl pb-4 sm:my-auto sm:pb-20">
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="flex w-full flex-col items-center gap-2 px-4"
      >
        <Typography variant="h2">What phrase do you want to learn?</Typography>
        <textarea
          name="phrase"
          ref={textRef}
          value={draft}
          onChange={handleChange}
          onFocus={() => {
            setIsTyping(true);
          }}
          onBlur={() => setIsTyping(false)}
          autoComplete="on"
          placeholder="Enter a phrase to learn"
          className="mt-4 h-32 w-full rounded-xl border border-white/60 bg-white/10 px-4 py-2 text-xl font-semibold placeholder-white/50 backdrop-blur-md focus:ring-2 focus:ring-white focus:outline-none"
        />
        {(isTyping || draft) && (
          <Button
            disabled={genFlashcards.isPending}
            type="submit"
            className="w-full"
          >
            Learn
          </Button>
        )}
      </form>
    </div>
  );
};
