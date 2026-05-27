export const voiceProfiles = [
  {
    name: "Nova",
    role: "Teen valley narrator",
    identity: "Bright, upbeat valley-girl energy",
    detail: "Playful, breezy, youthful",
    mood: "Like, polished but totally effortless",
  },
  {
    name: "Alloy",
    role: "Product voice",
    identity: "Clean neutral studio voice",
    detail: "Neutral, clear, product-ready",
    mood: "Crisp delivery for launches and demos",
  },
  {
    name: "Verse",
    role: "Expressive lead",
    identity: "Confident cinematic voice",
    detail: "Expressive, confident, modern",
    mood: "Forward motion with a polished edge",
  },
  {
    name: "Sage",
    role: "Documentary guide",
    identity: "Calm trusted narrative voice",
    detail: "Calm, trusted, documentary",
    mood: "Measured pacing for thoughtful stories",
  },
  {
    name: "Coral",
    role: "Warm host",
    identity: "Close elegant editorial voice",
    detail: "Warm, close, elegant",
    mood: "Soft presence for intimate reads",
  },
] as const;

export const voiceStyles = [
  "Calm",
  "Warm",
  "Cheerful",
  "Whisper",
  "Energetic",
  "Cinematic",
  "Intimate",
  "Storyteller",
] as const;

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
  "Welcome to Voxa. Turn rough ideas into natural, expressive voiceovers in Persian or English, then generate studio-grade speech with your preferred AI provider.";
