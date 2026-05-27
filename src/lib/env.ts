export function serverEnv(name: string, fallback = "") {
  const value = process.env[name]?.trim();
  return value ? value : fallback;
}

export function activeTtsProvider() {
  return serverEnv("TTS_PROVIDER", "openai").toLowerCase();
}

export function activeTextProvider() {
  return serverEnv("TEXT_PROVIDER", "mock").toLowerCase();
}

export function hasSecret(name: string) {
  return Boolean(process.env[name]?.trim());
}
