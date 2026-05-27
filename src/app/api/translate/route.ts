import { NextResponse } from "next/server";
import { detectLanguage } from "@/lib/language";
import { ApiError, jsonError, parseJson } from "@/lib/http";
import { createTextProvider } from "@/providers/text";
import type { RewriteRequest } from "@/providers/text/types";

export async function POST(request: Request) {
  try {
    const body = await parseJson<Partial<RewriteRequest> & { provider?: string }>(request);
    const text = body.text?.trim();

    if (!text) {
      throw new ApiError("Enter text before translating.", 400, "empty_text");
    }

    const detected = detectLanguage(text);
    const targetLanguage = body.targetLanguage === "fa" || body.targetLanguage === "en" ? body.targetLanguage : detected === "fa" ? "en" : "fa";
    const provider = createTextProvider(body.provider);
    const response = await provider.translate({
      text,
      tone: body.tone ?? "Natural",
      targetLanguage,
    });

    return NextResponse.json(response);
  } catch (error) {
    return jsonError(error);
  }
}
