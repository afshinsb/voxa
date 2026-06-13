import { NextResponse } from "next/server";
import { detectLanguage } from "@/lib/language";
import { jsonError, parseJson } from "@/lib/http";
import { validateTtsRequestBody } from "@/lib/api-validation";
import { getTonePreset, getVoiceCharacter } from "@/lib/voice-config";
import { createTtsProvider } from "@/providers/tts";

export async function POST(request: Request) {
  try {
    const body = validateTtsRequestBody(await parseJson<unknown>(request));
    const provider = createTtsProvider(body.provider);
    const character = getVoiceCharacter(body.voice);
    const tone = getTonePreset(body.style);

    console.info("[tts]", {
      provider: provider.name,
      model: provider.model,
      character_id: character.id,
      character: character.displayName,
      tone_id: tone.id,
      tone: tone.displayName,
      generation_mode: body.generationMode ?? "balanced",
      chunking: body.chunking ?? "single",
      characters: body.text.length,
    });

    const response = await provider.generateSpeech({
      text: body.text,
      voice: body.voice,
      style: body.style,
      speed: body.speed,
      language: body.language ?? detectLanguage(body.text),
      generationMode: body.generationMode,
      chunking: body.chunking,
    });

    return NextResponse.json(response);
  } catch (error) {
    return jsonError(error);
  }
}
