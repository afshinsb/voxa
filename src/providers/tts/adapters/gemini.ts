import { serverEnv } from "@/lib/env";
import { getTonePreset, getVoiceCharacter } from "@/lib/voice-config";
import type { TtsGenerationMode, TtsRequest } from "../types";

function languageDirection(language: TtsRequest["language"]) {
  if (language === "fa") {
    return "Native Persian pronunciation when Persian is used. Avoid English accent unless English text appears.";
  }

  if (language === "en") {
    return "Native English pronunciation when English is used. Avoid Persian accent unless Persian text appears.";
  }

  return "Native Persian pronunciation when Persian is used. Native English pronunciation when English is used. Avoid mixed accent unless requested.";
}

function consistencyRules(mode: TtsGenerationMode) {
  const base = [
    "The speaker identity is locked by the selected character.",
    "Do not let tone change the person, age, gender, accent, vocal weight, or voice texture.",
    "Tone changes delivery only: pacing, emphasis, volume feeling, emotion, pauses, and rhythm.",
    "Keep the same speaker throughout the full text.",
    "Avoid sudden pitch jumps, noisy audio, unstable breathiness, or drifting into a new voice.",
  ];

  if (mode === "highest_consistency") {
    base.push("Reinforce the same speaker identity at every paragraph boundary.", "Prioritize voice continuity over extra expressiveness.");
  }

  if (mode === "lowest_quota") {
    base.push("Use one clean pass with conservative identity preservation and no unnecessary variation.");
  }

  return base.join(" ");
}

export function geminiVoiceName(input: TtsRequest) {
  const character = getVoiceCharacter(input.voice);
  return serverEnv(`GEMINI_TTS_VOICE_${character.id.toUpperCase()}`, character.providerVoiceId.gemini);
}

export function buildGeminiSpeechPrompt(input: TtsRequest) {
  const character = getVoiceCharacter(input.voice);
  const tone = getTonePreset(input.style);
  const mode = input.generationMode ?? "balanced";

  return [
    `Speaker identity:\n${character.displayName}: ${character.defaultStylePrompt}`,
    "Identity lock:\nThe selected character is the base speaker. Preserve this exact speaker as much as the API allows. Do not create a new character for the tone.",
    `Delivery tone:\n${tone.displayName}: ${tone.styleInstruction} Speaking rate target ${tone.speakingRate}; energy ${tone.energy}; emotion strength ${tone.emotionStrength}; pitch adjustment ${tone.pitch}.`,
    `Language:\n${languageDirection(input.language)}`,
    "Audio quality:\nClean studio-quality speech, no background noise, no distortion, no clipping, no whispery artifacts unless Whisper is selected, and even then keep it clean.",
    `Rules:\n${consistencyRules(mode)}`,
    `Read this text aloud exactly:\n${input.text}`,
  ].join("\n\n");
}
