import { generateText } from "ai";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function generateWithGemini(
  systemPrompt: string,
  userPrompt: string,
  options?: {
    temperature?: number;
    maxTokens?: number;
  }
): Promise<string> {
  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const { text } = await generateText({
        model: "google/gemini-2.0-flash",
        system: systemPrompt,
        prompt: userPrompt,
        temperature: options?.temperature ?? 0.7,
        maxOutputTokens: options?.maxTokens ?? 8192,
      });
      return text;
    } catch (error) {
      lastError = error as Error;
      console.warn(`Gemini API attempt ${attempt + 1} failed:`, error);
      if (attempt < maxRetries - 1) {
        await sleep(Math.pow(2, attempt) * 1000);
      }
    }
  }

  throw lastError || new Error("Gemini API failed after retries");
}

export async function generateWithValidator(
  systemPrompt: string,
  userPrompt: string,
  options?: {
    temperature?: number;
    maxTokens?: number;
  }
): Promise<string> {
  const { text } = await generateText({
    model: "deepseek/deepseek-v4-flash",
    system: systemPrompt,
    prompt: userPrompt,
    temperature: options?.temperature ?? 0.1,
    maxOutputTokens: options?.maxTokens ?? 4096,
  });

  return text;
}
