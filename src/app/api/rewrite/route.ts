import { NextResponse } from "next/server";
import { validateRewriteRequestBody } from "@/lib/api-validation";
import { jsonError, parseJson } from "@/lib/http";
import { createTextProvider } from "@/providers/text";

export async function POST(request: Request) {
  try {
    const body = validateRewriteRequestBody(await parseJson<unknown>(request));
    const provider = createTextProvider(body.provider);
    const response = await provider.rewrite({
      text: body.text,
      tone: body.tone,
      targetLanguage: body.targetLanguage,
    });

    return NextResponse.json(response);
  } catch (error) {
    return jsonError(error);
  }
}
