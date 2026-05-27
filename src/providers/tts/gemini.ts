import { ApiError } from "@/lib/http";
import { serverEnv } from "@/lib/env";
import { missingEnvFor } from "@/lib/provider-config";
import { buildGeminiSpeechPrompt } from "./prompt-adapters/gemini";
import type { TtsProvider, TtsRequest, TtsResponse } from "./types";

function wavFromPcmBuffer(pcm: Buffer, sampleRate = 24000, channels = 1, bitsPerSample = 16) {
  const header = Buffer.alloc(44);
  const byteRate = sampleRate * channels * (bitsPerSample / 8);
  const blockAlign = channels * (bitsPerSample / 8);

  header.write("RIFF", 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write("data", 36);
  header.writeUInt32LE(pcm.length, 40);

  return Buffer.concat([header, pcm]).toString("base64");
}

function wavFromPcmBase64(base64: string) {
  return wavFromPcmBuffer(Buffer.from(base64, "base64"));
}

function splitTextForGemini(text: string, maxChars = 900) {
  const paragraphs = text.split(/\n{2,}/).map((part) => part.trim()).filter(Boolean);
  const chunks: string[] = [];
  let current = "";

  for (const paragraph of paragraphs.length ? paragraphs : [text]) {
    if (`${current}\n\n${paragraph}`.trim().length <= maxChars) {
      current = `${current}\n\n${paragraph}`.trim();
      continue;
    }

    if (current) chunks.push(current);

    if (paragraph.length <= maxChars) {
      current = paragraph;
      continue;
    }

    const sentences = paragraph.match(/[^.!?]+[.!?]*/g) ?? [paragraph];
    current = "";
    for (const sentence of sentences) {
      if (`${current} ${sentence}`.trim().length > maxChars && current) {
        chunks.push(current.trim());
        current = sentence.trim();
      } else {
        current = `${current} ${sentence}`.trim();
      }
    }
  }

  if (current) chunks.push(current);
  return chunks;
}

export class GeminiTtsProvider implements TtsProvider {
  name = "gemini" as const;
  model = serverEnv("GEMINI_TTS_MODEL", "gemini-2.5-flash-preview-tts");

  isConfigured() {
    return missingEnvFor("tts", this.name).length === 0;
  }

  private async generatePcm(input: TtsRequest, attempt = 0): Promise<string> {
    const apiKey = serverEnv("GEMINI_API_KEY");
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: buildGeminiSpeechPrompt(input) }] }],
          generationConfig: {
            responseModalities: ["AUDIO"],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: serverEnv("GEMINI_TTS_VOICE", "Kore"),
                },
              },
            },
          },
        }),
      },
    );

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      const message = body?.error?.message ?? "Voice generation failed at the selected provider.";
      const code = response.status === 429 ? "quota_exceeded" : "provider_error";
      const canRetry = input.generationMode === "highest_consistency" && attempt === 0 && response.status >= 500;
      if (canRetry) return this.generatePcm(input, attempt + 1);
      throw new ApiError(message, response.status, code);
    }

    const body = await response.json();
    const part = body?.candidates?.[0]?.content?.parts?.find((item: { inlineData?: { data?: string } }) => item.inlineData?.data);
    const audioBase64 = part?.inlineData?.data;

    if (!audioBase64) {
      throw new ApiError("The selected provider returned an empty audio response.", 502, "empty_provider_response");
    }

    return audioBase64;
  }

  async generateSpeech(input: TtsRequest): Promise<TtsResponse> {
    if (!this.isConfigured()) {
      throw new ApiError("Voice provider configuration is incomplete.", 500, "provider_not_configured");
    }

    const shouldSplit = input.chunking === "split";
    let audioBase64: string;

    if (shouldSplit) {
      const pcmChunks: Buffer[] = [];
      for (const chunk of splitTextForGemini(input.text)) {
        const pcm = await this.generatePcm({ ...input, text: chunk, generationMode: input.generationMode ?? "highest_consistency" });
        pcmChunks.push(Buffer.from(pcm, "base64"));
      }
      audioBase64 = wavFromPcmBuffer(Buffer.concat(pcmChunks));
    } else {
      audioBase64 = wavFromPcmBase64(await this.generatePcm(input));
    }

    return {
      audioBase64,
      mimeType: "audio/wav",
      extension: "wav",
      provider: this.name,
      model: this.model,
    };
  }
}
