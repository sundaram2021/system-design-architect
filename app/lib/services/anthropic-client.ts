import Anthropic from "@anthropic-ai/sdk";

export const DEFAULT_ANTHROPIC_MODEL =
  process.env.ANTHROPIC_MODEL || "claude-haiku-5-5";

const FALLBACK_ANTHROPIC_MODEL = "claude-3-5-haiku-20241022";

let cachedClient: Anthropic | null = null;

function getAnthropicClient(): Anthropic {
  if (cachedClient) return cachedClient;

  const apiKey =
    process.env.ANTHROPIC_API_KEY ||
    process.env.ANTRHOPIC_API_KEY ||
    process.env.AI_GATEWAY_API_KEY;

  if (!apiKey) {
    throw new Error(
      "Missing Anthropic API key. Please set ANTHROPIC_API_KEY in .env.local"
    );
  }

  cachedClient = new Anthropic({ apiKey });
  return cachedClient;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface AnthropicGenerateOptions {
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

export async function generateAnthropicText(
  systemPrompt: string,
  userPrompt: string,
  options?: AnthropicGenerateOptions
): Promise<string> {
  const client = getAnthropicClient();
  const maxRetries = 3;
  let lastError: Error | null = null;
  let targetModel = options?.model || DEFAULT_ANTHROPIC_MODEL;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await client.messages.create({
        model: targetModel,
        max_tokens: options?.maxTokens ?? 4096,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }]
      });

      const textParts = response.content
        .filter((block) => block.type === "text")
        .map((block) => (block as { type: "text"; text: string }).text);

      return textParts.join("\n");
    } catch (error: unknown) {
      lastError = error instanceof Error ? error : new Error(String(error));
      const errorMessage = lastError.message.toLowerCase();

      // Fallback model if target model is not available
      if (
        (errorMessage.includes("not found") || errorMessage.includes("invalid model")) &&
        targetModel !== FALLBACK_ANTHROPIC_MODEL
      ) {
        console.warn(`Model ${targetModel} unavailable, falling back to ${FALLBACK_ANTHROPIC_MODEL}`);
        targetModel = FALLBACK_ANTHROPIC_MODEL;
        continue;
      }

      console.warn(`Anthropic API attempt ${attempt + 1} failed:`, lastError.message);
      if (attempt < maxRetries - 1) {
        await sleep(Math.pow(2, attempt) * 1000);
      }
    }
  }

  throw lastError || new Error("Anthropic API failed after retries");
}
