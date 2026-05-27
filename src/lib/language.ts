export type DetectedLanguage = "fa" | "en" | "mixed";

const persianRegex = /[\u0600-\u06FF]/;
const latinRegex = /[A-Za-z]/;

export function detectLanguage(text: string): DetectedLanguage {
  const hasPersian = persianRegex.test(text);
  const hasLatin = latinRegex.test(text);

  if (hasPersian && hasLatin) return "mixed";
  if (hasPersian) return "fa";
  return "en";
}
