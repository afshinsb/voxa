import type { TextProviderName } from "@/lib/provider-registry";

export type { TextProviderName } from "@/lib/provider-registry";
export type RewriteTone = "Natural" | "Warm" | "Cute" | "Flirty but classy" | "Professional" | "Cinematic" | "Storytelling";
export type TargetLanguage = "auto" | "fa" | "en";

export interface RewriteRequest {
  text: string;
  tone: RewriteTone;
  targetLanguage?: TargetLanguage;
}

export interface TextResult {
  text: string;
  detectedLanguage: "fa" | "en" | "mixed";
  provider: TextProviderName;
  model: string;
}

export interface TextProvider {
  name: TextProviderName;
  model: string;
  isConfigured(): boolean;
  rewrite(input: RewriteRequest): Promise<TextResult>;
  translate(input: RewriteRequest & { targetLanguage: "fa" | "en" }): Promise<TextResult>;
}
