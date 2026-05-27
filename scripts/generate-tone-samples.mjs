import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const baseUrl = process.env.VOXA_BASE_URL ?? "http://localhost:3000";
const character = process.argv[2] ?? "chloe";
const text =
  process.argv.slice(3).join(" ") ||
  "Same speaker, same sentence. The tone should change clearly, but the person speaking should stay consistent.";

const tones = ["calm", "warm", "cheerful", "whisper", "energetic", "cinematic", "intimate", "storyteller"];
const outputDir = path.join(process.cwd(), "samples", "tts-tone-comparison", character);

await mkdir(outputDir, { recursive: true });

for (const tone of tones) {
  const response = await fetch(`${baseUrl}/api/tts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text,
      voice: character,
      style: tone,
      speed: 1,
      generationMode: "highest_consistency",
      chunking: "single",
    }),
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(`${tone} failed: ${payload.error ?? response.statusText}`);
  }

  const extension = payload.extension ?? "mp3";
  const filename = `${tone}.${extension}`;
  await writeFile(path.join(outputDir, filename), Buffer.from(payload.audioBase64, "base64"));
  console.log(`${payload.character?.displayName ?? character} / ${payload.tone?.displayName ?? tone}: ${path.join(outputDir, filename)}`);
}
