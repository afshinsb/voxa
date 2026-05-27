import { getTonePreset, getVoiceCharacter } from "@/lib/voice-config";
import type { TtsRequest } from "../types";

export function buildOpenAiTtsPayload(input: TtsRequest, model: string) {
  const character = getVoiceCharacter(input.voice);
  const tone = getTonePreset(input.style);
  const speed = Math.min(Math.max(input.speed * tone.speakingRate, 0.5), 2);

  return {
    model,
    voice: character.providerVoiceId.openai,
    input: input.text,
    response_format: "mp3",
    speed,
    instructions: [
      `Base speaker character: ${character.displayName}.`,
      `Speaker identity: ${character.defaultStylePrompt}`,
      "The selected character controls the person speaking. Do not randomize the voice. Do not change age, gender, accent family, vocal weight, or core texture between tones.",
      `Delivery tone: ${tone.displayName}. ${tone.styleInstruction}`,
      `Tone controls only delivery. Energy target ${tone.energy}; emotion strength ${tone.emotionStrength}; pitch adjustment ${tone.pitch}.`,
      "Make the tone difference clearly audible, especially for energetic, cinematic, whisper, and storyteller reads, while keeping the same speaker identity.",
    ].join(" "),
  };
}
