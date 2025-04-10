import { createOpenAI } from "@ai-sdk/openai";
import OpenAI from "openai";

import { env } from "~/env";

export const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

export const openaiSDK = createOpenAI({
  apiKey: env.OPENAI_API_KEY,
  compatibility: "strict",
});
