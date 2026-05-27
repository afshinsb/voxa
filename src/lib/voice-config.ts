export const voiceCharacters = [
  {
    id: "chloe",
    displayName: "Chloe",
    gender: "female",
    description: "Young, playful, trendy valley-girl style with a bright feminine voice.",
    role: "Trendy playful lead",
    providerVoiceId: {
      openai: "nova",
      gemini: "Kore",
      elevenlabsEnv: "ELEVENLABS_VOICE_ID_CHLOE",
    },
    defaultStylePrompt:
      "A youthful modern female speaker with bright feminine tone, playful confidence, fashionable valley-girl cadence, clear pronunciation, and polished studio presence. Keep her tasteful, natural, and never cartoonish.",
  },
  {
    id: "vivian",
    displayName: "Vivian",
    gender: "female",
    description: "Professional secretary and assistant voice, polished, clear, elegant.",
    role: "Executive assistant",
    providerVoiceId: {
      openai: "alloy",
      gemini: "Aoede",
      elevenlabsEnv: "ELEVENLABS_VOICE_ID_VIVIAN",
    },
    defaultStylePrompt:
      "A polished professional female assistant with elegant diction, clear articulation, organized pacing, calm confidence, and refined office-studio presence.",
  },
  {
    id: "mia",
    displayName: "Mia",
    gender: "female",
    description: "Thin, soft, light, airy feminine voice.",
    role: "Soft airy narrator",
    providerVoiceId: {
      openai: "shimmer",
      gemini: "Zephyr",
      elevenlabsEnv: "ELEVENLABS_VOICE_ID_MIA",
    },
    defaultStylePrompt:
      "A thin, soft, light feminine speaker with airy brightness, gentle texture, delicate pronunciation, low vocal weight, and clean close-studio clarity.",
  },
  {
    id: "titan",
    displayName: "Titan",
    gender: "male",
    description: "Extremely deep, thick, powerful masculine voice.",
    role: "Deep power voice",
    providerVoiceId: {
      openai: "onyx",
      gemini: "Fenrir",
      elevenlabsEnv: "ELEVENLABS_VOICE_ID_TITAN",
    },
    defaultStylePrompt:
      "An extremely deep, thick, powerful masculine speaker with heavy low-end resonance, strong chest presence, controlled authority, and clean studio-quality articulation.",
  },
  {
    id: "vincent",
    displayName: "Vincent",
    gender: "male",
    description: "Cinematic dubbed narrator voice, dramatic and studio-quality.",
    role: "Cinematic narrator",
    providerVoiceId: {
      openai: "fable",
      gemini: "Charon",
      elevenlabsEnv: "ELEVENLABS_VOICE_ID_VINCENT",
    },
    defaultStylePrompt:
      "A cinematic male dubbed narrator with dramatic studio tone, rich projection, precise diction, theatrical control, and premium trailer-ready presence.",
  },
  {
    id: "adam",
    displayName: "Adam",
    gender: "male",
    description: "Normal balanced male voice, natural and trustworthy.",
    role: "Balanced trusted male",
    providerVoiceId: {
      openai: "echo",
      gemini: "Puck",
      elevenlabsEnv: "ELEVENLABS_VOICE_ID_ADAM",
    },
    defaultStylePrompt:
      "A balanced natural male speaker with trustworthy tone, clear pronunciation, moderate depth, conversational warmth, and steady studio presence.",
  },
] as const;

export const tonePresets = [
  {
    id: "calm",
    displayName: "Calm",
    styleInstruction:
      "Use a noticeably slower pace, softer energy, relaxed delivery, low intensity, and smooth natural pauses. Keep the same speaker identity.",
    speakingRate: 0.88,
    pitch: 0,
    energy: 0.28,
    emotionStrength: 0.25,
  },
  {
    id: "warm",
    displayName: "Warm",
    styleInstruction:
      "Sound friendly, caring, slightly smiling, and emotionally open. Add warmth and gentle connection without changing the base voice.",
    speakingRate: 0.96,
    pitch: 0.05,
    energy: 0.46,
    emotionStrength: 0.45,
  },
  {
    id: "cheerful",
    displayName: "Cheerful",
    styleInstruction:
      "Make the delivery clearly happy, upbeat, brighter, and more expressive, with lively phrasing and a smiling tone. Do not change age, gender, accent, or voice texture.",
    speakingRate: 1.06,
    pitch: 0.12,
    energy: 0.72,
    emotionStrength: 0.72,
  },
  {
    id: "whisper",
    displayName: "Whisper",
    styleInstruction:
      "Use a very soft close-mic feeling, low volume impression, intimate breath control, and delicate articulation while staying fully intelligible. Do not become noisy, raspy, or a different speaker.",
    speakingRate: 0.82,
    pitch: -0.06,
    energy: 0.16,
    emotionStrength: 0.62,
  },
  {
    id: "energetic",
    displayName: "Energetic",
    styleInstruction:
      "Use a faster pace, high excitement, punchy emphasis, crisp attacks, and clear forward momentum. Make the energy obvious while preserving the exact same speaker identity.",
    speakingRate: 1.18,
    pitch: 0.08,
    energy: 0.92,
    emotionStrength: 0.88,
  },
  {
    id: "cinematic",
    displayName: "Cinematic",
    styleInstruction:
      "Use dramatic pacing, strong pauses, controlled intensity, trailer-style emphasis, and premium narrator presence. Make it cinematic, not exaggerated parody, and keep the same speaker.",
    speakingRate: 0.92,
    pitch: -0.05,
    energy: 0.78,
    emotionStrength: 0.82,
  },
  {
    id: "intimate",
    displayName: "Intimate",
    styleInstruction:
      "Use a close, gentle, personal, low-energy delivery with soft phrasing and private conversational presence. Preserve the base speaker identity.",
    speakingRate: 0.9,
    pitch: -0.03,
    energy: 0.22,
    emotionStrength: 0.48,
  },
  {
    id: "storyteller",
    displayName: "Storyteller",
    styleInstruction:
      "Use expressive narration, clear rhythm, emotional but natural phrasing, varied sentence shape, and purposeful pauses. Make the storytelling difference noticeable without changing the speaker.",
    speakingRate: 0.98,
    pitch: 0.02,
    energy: 0.64,
    emotionStrength: 0.76,
  },
] as const;

export type VoiceCharacterId = (typeof voiceCharacters)[number]["id"];
export type TonePresetId = (typeof tonePresets)[number]["id"];
export type VoiceCharacter = (typeof voiceCharacters)[number];
export type TonePreset = (typeof tonePresets)[number];

const oldVoiceMap: Record<string, VoiceCharacterId> = {
  Nova: "chloe",
  Alloy: "adam",
  Verse: "vincent",
  Sage: "adam",
  Coral: "vivian",
};

const oldToneMap: Record<string, TonePresetId> = {
  Calm: "calm",
  Warm: "warm",
  Cheerful: "cheerful",
  Whisper: "whisper",
  Energetic: "energetic",
  Cinematic: "cinematic",
  Intimate: "intimate",
  Storyteller: "storyteller",
};

export function normalizeCharacterId(value: string | undefined): VoiceCharacterId {
  const direct = voiceCharacters.find((character) => character.id === value);
  if (direct) return direct.id;
  return oldVoiceMap[value ?? ""] ?? "chloe";
}

export function normalizeToneId(value: string | undefined): TonePresetId {
  const direct = tonePresets.find((tone) => tone.id === value);
  if (direct) return direct.id;
  return oldToneMap[value ?? ""] ?? "calm";
}

export function getVoiceCharacter(value: string | undefined): VoiceCharacter {
  const id = normalizeCharacterId(value);
  return voiceCharacters.find((character) => character.id === id) ?? voiceCharacters[0];
}

export function getTonePreset(value: string | undefined): TonePreset {
  const id = normalizeToneId(value);
  return tonePresets.find((tone) => tone.id === id) ?? tonePresets[0];
}
