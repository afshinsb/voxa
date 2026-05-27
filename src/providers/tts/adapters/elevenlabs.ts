import { serverEnv } from "@/lib/env";
import { getTonePreset, getVoiceCharacter } from "@/lib/voice-config";
import type { TtsRequest } from "../types";

export function elevenLabsVoiceId(input: TtsRequest) {
  const character = getVoiceCharacter(input.voice);
  return serverEnv(character.providerVoiceId.elevenlabsEnv, serverEnv("ELEVENLABS_VOICE_ID"));
}

export function elevenLabsPayload(input: TtsRequest, model: string) {
  const character = getVoiceCharacter(input.voice);
  const tone = getTonePreset(input.style);
  const style = Math.min(0.95, Math.max(0.05, tone.emotionStrength));
  const stability = input.generationMode === "highest_consistency" ? 0.74 : tone.id === "energetic" || tone.id === "cinematic" ? 0.48 : 0.62;

  return {
    text: input.text,
    model_id: model,
    voice_settings: {
      stability,
      similarity_boost: 0.88,
      style,
      speed: Math.min(1.2, Math.max(0.8, input.speed * tone.speakingRate)),
      use_speaker_boost: true,
    },
    pronunciation_dictionary_locators: [],
    seed: character.id.split("").reduce((sum, letter) => sum + letter.charCodeAt(0), 0),
  };
}
