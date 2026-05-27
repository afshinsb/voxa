import { NextResponse } from "next/server";
import { activeTextProvider, activeTtsProvider } from "@/lib/env";
import { missingEnvFor, requiredEnvFor, selectedProviderHealth } from "@/lib/provider-config";
import { listTextProviders } from "@/providers/text";
import { listTtsProviders } from "@/providers/tts";

export async function GET() {
  const tts = listTtsProviders();
  const text = listTextProviders();
  const selected = selectedProviderHealth();

  return NextResponse.json({
    active: {
      tts: activeTtsProvider(),
      text: activeTextProvider(),
    },
    selected,
    tts: tts.map((provider) => ({
      name: provider.name,
      model: provider.model,
      configured: provider.isConfigured(),
      active: provider.name === activeTtsProvider(),
      requiredEnv: requiredEnvFor("tts", provider.name),
      missingEnv: missingEnvFor("tts", provider.name),
    })),
    text: text.map((provider) => ({
      name: provider.name,
      model: provider.model,
      configured: provider.isConfigured(),
      active: provider.name === activeTextProvider(),
      requiredEnv: requiredEnvFor("text", provider.name),
      missingEnv: missingEnvFor("text", provider.name),
    })),
  });
}
