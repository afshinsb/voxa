import { NextResponse } from "next/server";
import { detectLanguage } from "@/lib/language";
import { ApiError, jsonError, parseJson } from "@/lib/http";
import { getTonePreset, getVoiceCharacter, normalizeCharacterId, normalizeToneId } from "@/lib/voice-config";
import { createTtsProvider } from "@/providers/tts";
import type { TtsRequest } from "@/providers/tts/types";

export async function POST(request: Request) {
  try {
    const body = await parseJson<Partial<TtsRequest> & { provider?: string }>(request);
    const text = body.text?.trim();

    if (!text) {
      throw new ApiError("Enter text before generating speech.", 400, "empty_text");
    }

    const provider = createTtsProvider(body.provider);
    const voice = normalizeCharacterId(body.voice);
    const style = normalizeToneId(body.style);
    const character = getVoiceCharacter(voice);
    const tone = getTonePreset(style);

    console.info("[tts]", {
      provider: provider.name,
      model: provider.model,
      character_id: character.id,
      character: character.displayName,
      tone_id: tone.id,
      tone: tone.displayName,
      generation_mode: body.generationMode ?? "balanced",
      chunking: body.chunking ?? "single",
      characters: text.length,
    });

    const response = await provider.generateSpeech({
      text,
      voice,
      style,
      speed: Number(body.speed ?? 1),
      language: body.language ?? detectLanguage(text),
      generationMode: body.generationMode ?? "balanced",
      chunking: body.chunking ?? "single",
    });

    return NextResponse.json(response);
  } catch (error) {
    return jsonError(error);
  }
}
