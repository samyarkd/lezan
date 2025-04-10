import type { audioSpeedValues } from "~/lib/zod/audio.zod";
import { openai } from "./openai.ai";

export async function generateAndUploadAudio(
  inputText: string,
  speed: (typeof audioSpeedValues)[number],
) {
  const speedNumber = speed === "slow" ? 0.7 : speed === "normal" ? 1 : 1.2;

  // Generate audio using the provided input text
  const audioRes: Response = await openai.audio.speech.create({
    input: inputText,
    model: "tts-1",
    voice: "alloy",
    speed: speedNumber,
    response_format: "mp3",
  });

  return {
    audioResult: audioRes,
  };
}
