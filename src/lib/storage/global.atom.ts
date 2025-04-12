import { atom } from "jotai";

export const turnstileTokenAtom = atom<string | null>(null);

export const isFinishedAtom = atom(false);
