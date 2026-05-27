import { NextResponse } from "next/server";
import { selectedProviderHealth } from "@/lib/provider-config";

export async function GET() {
  const providers = selectedProviderHealth();

  return NextResponse.json({
    ok: providers.tts.configured && providers.text.configured,
    service: "voxa",
    timestamp: new Date().toISOString(),
    providers,
  });
}
