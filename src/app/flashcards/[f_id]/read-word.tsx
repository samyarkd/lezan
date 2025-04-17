"use client";

import { AudioLines } from "lucide-react";

import { Button } from "~/components/ui/button";
import { useGenAudio } from "~/hooks/api.hooks";

export const ReadWordButton: React.FC<{
  flashcardId: string;
  word: string;
}> = ({ flashcardId, word }) => {
  const { mutateAsync, isPending } = useGenAudio();

  const handlePlay = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const blob = await mutateAsync({ flashcardId, word });
      if (!blob) {
        return;
      }
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      await audio.play();
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
