import { ApiError } from "@/lib/http";
import { tonePresets, voiceCharacters } from "@/lib/voice-config";
import type { TtsChunkingMode, TtsGenerationMode, TtsRequest } from "@/providers/tts/types";
import type { RewriteRequest, RewriteTone, TargetLanguage } from "@/providers/text/types";

const MAX_TEXT_LENGTH = 12000;
const MIN_TTS_SPEED = 0.5;
const MAX_TTS_SPEED = 2;

const generationModes = ["balanced", "lowest_quota", "highest_consistency"] as const satisfies readonly TtsGenerationMode[];
const chunkingModes = ["single", "split"] as const satisfies readonly TtsChunkingMode[];
const rewriteTones = ["Natural", "Warm", "Cute", "Flirty but classy", "Professional", "Cinematic", "Storytelling"] as const satisfies readonly RewriteTone[];
const targetLanguages = ["auto", "fa", "en"] as const satisfies readonly TargetLanguage[];
const ttsLanguages = ["fa", "en", "mixed"] as const;

type RequestBody = Record<string, unknown>;

export type ValidatedTtsBody = TtsRequest & { provider?: string };
export type ValidatedRewriteBody = RewriteRequest & { provider?: string };
export type ValidatedTranslateBody = RewriteRequest & { targetLanguage: "fa" | "en"; provider?: string };

function isObject(value: unknown): value is RequestBody {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function requestBody(value: unknown) {
  if (!isObject(value)) {
    throw new ApiError("Request body must be a JSON object.", 400, "invalid_request_body");
  }

  return value;
}

function validatedText(body: RequestBody, emptyMessage: string) {
  const text = typeof body.text === "string" ? body.text.trim() : "";

  if (!text) {
    throw new ApiError(emptyMessage, 400, "empty_text");
  }

  if (text.length > MAX_TEXT_LENGTH) {
    throw new ApiError(`Text must be ${MAX_TEXT_LENGTH.toLocaleString()} characters or fewer.`, 400, "text_too_long");
  }

  return text;
}

function optionalString(body: RequestBody, key: string) {
  const value = body[key];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function oneOf<T extends readonly string[]>(value: unknown, allowed: T, fallback: T[number], message: string, code: string): T[number] {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value === "string" && allowed.includes(value)) return value as T[number];
  throw new ApiError(message, 400, code);
}

function validatedSpeed(value: unknown) {
  if (value === undefined || value === null || value === "") return 1;

  const speed = typeof value === "number" || typeof value === "string" ? Number(value) : Number.NaN;
  if (!Number.isFinite(speed)) {
    throw new ApiError("Speed must be a number.", 400, "invalid_speed");
  }

  return Math.min(MAX_TTS_SPEED, Math.max(MIN_TTS_SPEED, speed));
}

function optionalTtsLanguage(value: unknown) {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value === "string" && ttsLanguages.includes(value as (typeof ttsLanguages)[number])) return value as (typeof ttsLanguages)[number];
  throw new ApiError("Language must be fa, en, or mixed.", 400, "invalid_language");
}

export function validateTtsRequestBody(value: unknown): ValidatedTtsBody {
  const body = requestBody(value);
  const text = validatedText(body, "Enter text before generating speech.");
  const voice = oneOf(
    body.voice,
    voiceCharacters.map((character) => character.id),
    "chloe",
    "Voice must be one of the supported voice characters.",
    "invalid_voice",
  );
  const style = oneOf(
    body.style,
    tonePresets.map((tone) => tone.id),
    "calm",
    "Style must be one of the supported tone presets.",
    "invalid_style",
  );

  return {
    text,
    voice,
    style,
    speed: validatedSpeed(body.speed),
    language: optionalTtsLanguage(body.language),
    generationMode: oneOf(body.generationMode, generationModes, "balanced", "Generation mode is not supported.", "invalid_generation_mode"),
    chunking: oneOf(body.chunking, chunkingModes, "single", "Chunking mode is not supported.", "invalid_chunking"),
    provider: optionalString(body, "provider"),
  };
}

export function validateRewriteRequestBody(value: unknown): ValidatedRewriteBody {
  const body = requestBody(value);

  return {
    text: validatedText(body, "Enter text before rewriting."),
    tone: oneOf(body.tone, rewriteTones, "Natural", "Rewrite tone is not supported.", "invalid_tone"),
    targetLanguage: oneOf(body.targetLanguage, targetLanguages, "auto", "Target language must be auto, fa, or en.", "invalid_target_language"),
    provider: optionalString(body, "provider"),
  };
}

export function validateTranslateRequestBody(value: unknown, fallbackTargetLanguage: "fa" | "en"): ValidatedTranslateBody {
  const body = requestBody(value);
  const text = validatedText(body, "Enter text before translating.");
  const targetLanguage = oneOf(body.targetLanguage, ["fa", "en"] as const, fallbackTargetLanguage, "Target language must be fa or en.", "invalid_target_language");

  return {
    text,
    tone: oneOf(body.tone, rewriteTones, "Natural", "Rewrite tone is not supported.", "invalid_tone"),
    targetLanguage,
    provider: optionalString(body, "provider"),
  };
}
