import { detectLanguage } from "@/lib/language";
import type { RewriteRequest, TextProvider, TextResult } from "./types";

const warmPrefix = {
  en: "Here is a smoother spoken version: ",
  fa: "نسخه طبیعی‌تر برای گفتار: ",
};

export class MockTextProvider implements TextProvider {
  name = "mock" as const;
  model = "local-mock-text";

  isConfigured() {
    return true;
  }

  async rewrite(input: RewriteRequest): Promise<TextResult> {
    await new Promise((resolve) => setTimeout(resolve, 650));
    const detectedLanguage = detectLanguage(input.text);
    const isFa = detectedLanguage === "fa";
    const prefix = isFa ? warmPrefix.fa : warmPrefix.en;

    return {
      text: `${prefix}${input.text.trim()}`,
      detectedLanguage,
      provider: this.name,
      model: this.model,
    };
  }

  async translate(input: RewriteRequest & { targetLanguage: "fa" | "en" }): Promise<TextResult> {
    await new Promise((resolve) => setTimeout(resolve, 650));
    const detectedLanguage = detectLanguage(input.text);
    const text =
      input.targetLanguage === "fa"
        ? `این یک ترجمه نمایشی و طبیعی برای تست محلی است: ${input.text.trim()}`
        : `This is a natural mock translation for local testing: ${input.text.trim()}`;

    return {
      text,
      detectedLanguage,
      provider: this.name,
      model: this.model,
    };
  }
}
