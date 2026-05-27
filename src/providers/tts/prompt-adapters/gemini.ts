import type { TtsGenerationMode, TtsRequest, VoiceStyle } from "../types";

const speakerDirections: Record<string, string> = {
  Nova: "A consistent youthful modern female speaker, bright but natural, clear pronunciation, soft friendly energy.",
  Alloy: "A consistent neutral modern studio speaker, clear pronunciation, balanced texture, calm professional presence.",
  Verse: "A consistent expressive modern speaker, confident but natural, clear pronunciation, polished media-ready presence.",
  Sage: "A consistent calm narrative speaker, trustworthy and measured, clear pronunciation, grounded documentary presence.",
  Coral: "A consistent warm editorial speaker, close and natural, clear pronunciation, soft refined presence.",
};

const deliveryDirections: Record<VoiceStyle, string> = {
  Calm: "Calm, steady delivery with relaxed pacing and natural pauses.",
  Warm: "Warm conversational tone, expressive but not theatrical, natural pauses.",
  Cheerful: "Bright controlled optimism with friendly momentum, avoiding exaggerated pitch shifts.",
  Whisper: "Soft intimate delivery while remaining clear and fully intelligible, not breathy or unstable.",
  Energetic: "Crisp energetic delivery with forward motion, while keeping the same voice texture.",
  Cinematic: "Composed cinematic pacing with tasteful emphasis, not trailer parody.",
  Intimate: "Quiet personal delivery with close presence and natural pauses.",
  Storyteller: "Narrative pacing with expressive pauses and clear scene-to-scene continuity.",
};

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
    "Do not change speaker identity when changing emotion.",
    "Emotion should affect delivery only, not age, accent, gender, or voice texture.",
    "Keep the same voice throughout the full text.",
    "Avoid sudden pitch changes.",
    "Avoid noisy or unstable audio.",
  ];

  if (mode === "highest_consistency") {
    base.push(
      "Reinforce the same speaker identity at paragraph boundaries.",
      "Prioritize voice continuity over extra expressiveness.",
    );
  }

  if (mode === "lowest_quota") {
    base.push("Use one clean pass with stable, conservative delivery.");
  }

  return base.join(" ");
}

export function geminiVoiceDirection(voice: string) {
  return speakerDirections[voice] ?? speakerDirections.Alloy;
}

export function buildGeminiSpeechPrompt(input: TtsRequest) {
  const mode = input.generationMode ?? "balanced";

  return [
    `Speaker identity:\n${geminiVoiceDirection(input.voice)}`,
    `Delivery:\n${deliveryDirections[input.style] ?? deliveryDirections.Calm} Speed target: ${input.speed}x.`,
    `Language:\n${languageDirection(input.language)}`,
    "Audio quality:\nClean studio-quality speech, no background noise, no distortion, no whispery artifacts.",
    `Rules:\n${consistencyRules(mode)}`,
    `Read this text aloud exactly:\n${input.text}`,
  ].join("\n\n");
}
