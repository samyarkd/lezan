"use client";

import { useEffect } from "react";
import { experimental_useObject as useObject } from "@ai-sdk/react";

import { flashcardsOutputSchema } from "~/lib/zod/flashcards.zod";

export default function HomePage() {
  const { object, submit, isLoading, stop } = useObject({
    api: "/api/test",
    schema: flashcardsOutputSchema,
  });

  useEffect(() => {
    submit("hello");
  }, []);

  return <div>heloooo</div>;
}
