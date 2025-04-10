import { z } from "zod";

export const audioSpeedValues = ["slow", "normal", "fast"] as const;

export const audioQuerySchema = z.object({
  flashcardId: z.string().nonempty(),
  word: z.string().nonempty(),
  speed: z.enum(audioSpeedValues),
});
