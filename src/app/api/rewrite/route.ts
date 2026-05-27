import { NextResponse } from "next/server";
import { ApiError, jsonError, parseJson } from "@/lib/http";
import { createTextProvider } from "@/providers/text";
import type { RewriteRequest } from "@/providers/text/types";

export async function POST(request: Request) {
  try {
    const body = await parseJson<Partial<RewriteRequest> & { provider?: string }>(request);
    const text = body.text?.trim();

    if (!text) {
      throw new ApiError("Enter text before rewriting.", 400, "empty_text");
    }

    const provider = createTextProvider(body.provider);
    const response = await provider.rewrite({
      text,
      tone: body.tone ?? "Natural",
      targetLanguage: body.targetLanguage ?? "auto",
    });

    return NextResponse.json(response);
  } catch (error) {
    return jsonError(error);
  }
}
