import { tonePresets, voiceCharacters } from "@/lib/voice-config";

export const voiceProfiles = voiceCharacters;
export const voiceStyles = tonePresets;

export const rewriteTones = [
  "Natural",
  "Warm",
  "Cute",
  "Flirty but classy",
  "Professional",
  "Cinematic",
  "Storytelling",
] as const;

export const sampleText =
  "Welcome to Voxa. Turn rough ideas into natural, expressive voiceovers, then generate studio-grade speech with your preferred AI provider.";
