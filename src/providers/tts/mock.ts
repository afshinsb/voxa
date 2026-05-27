import { getTonePreset, getVoiceCharacter } from "@/lib/voice-config";
import type { TtsProvider, TtsRequest, TtsResponse } from "./types";

function writeString(view: DataView, offset: number, value: string) {
  for (let i = 0; i < value.length; i += 1) {
    view.setUint8(offset + i, value.charCodeAt(i));
  }
}

function createMockWav(text: string, speed: number) {
  const sampleRate = 24000;
  const seconds = Math.min(8, Math.max(1.8, text.length / 42 / speed));
  const length = Math.floor(sampleRate * seconds);
  const buffer = new ArrayBuffer(44 + length * 2);
  const view = new DataView(buffer);

  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + length * 2, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, "data");
  view.setUint32(40, length * 2, true);

  for (let i = 0; i < length; i += 1) {
    const t = i / sampleRate;
    const envelope = Math.sin(Math.PI * Math.min(1, i / 2400)) * Math.sin(Math.PI * Math.min(1, (length - i) / 2400));
    const carrier = Math.sin(2 * Math.PI * (170 + Math.sin(t * 3) * 40) * t);
    const overtone = Math.sin(2 * Math.PI * 340 * t) * 0.32;
    view.setInt16(44 + i * 2, Math.floor((carrier + overtone) * envelope * 5800), true);
  }

  return Buffer.from(buffer);
}

export class MockTtsProvider implements TtsProvider {
  name = "mock" as const;
  model = "local-mock-wav";

  isConfigured() {
    return true;
  }

  async generateSpeech(input: TtsRequest): Promise<TtsResponse> {
    await new Promise((resolve) => setTimeout(resolve, 900));
    const audio = createMockWav(input.text, input.speed);

    return {
      audioBase64: audio.toString("base64"),
      mimeType: "audio/wav",
      extension: "wav",
      provider: this.name,
      model: this.model,
      character: {
        id: getVoiceCharacter(input.voice).id,
        displayName: getVoiceCharacter(input.voice).displayName,
      },
      tone: {
        id: getTonePreset(input.style).id,
        displayName: getTonePreset(input.style).displayName,
      },
      durationHintSeconds: Math.min(8, Math.max(1.8, input.text.length / 42 / input.speed)),
    };
  }
}
