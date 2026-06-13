import { NextResponse } from "next/server";
import { detectLanguage } from "@/lib/language";
import { validateTranslateRequestBody } from "@/lib/api-validation";
import { jsonError, parseJson } from "@/lib/http";
import { createTextProvider } from "@/providers/text";

export async function POST(request: Request) {
  try {
    const rawBody = await parseJson<unknown>(request);
    const rawRecord = typeof rawBody === "object" && rawBody && !Array.isArray(rawBody) ? (rawBody as Record<string, unknown>) : {};
    const rawText = typeof rawRecord.text === "string" ? rawRecord.text.trim() : "";
    const fallbackTargetLanguage = detectLanguage(rawText) === "fa" ? "en" : "fa";
    const body = validateTranslateRequestBody(rawBody, fallbackTargetLanguage);
    const provider = createTextProvider(body.provider);
    const response = await provider.translate({
      text: body.text,
      tone: body.tone,
      targetLanguage: body.targetLanguage,
    });

    return NextResponse.json(response);
  } catch (error) {
    return jsonError(error);
  }
}
