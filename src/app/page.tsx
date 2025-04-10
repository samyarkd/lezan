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

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-emerald-700 p-28 text-center text-2xl font-bold">
      <h1 className="animate-pulse">Lezano</h1>
      here:
      <code>
        <pre>it will be here: {JSON.stringify(object, null, 2)}</pre>
      </code>
    </main>
  );
}
