import { z } from "zod";
import {
  generateAnthropicText,
  DEFAULT_ANTHROPIC_MODEL,
  type AnthropicGenerateOptions
} from "./anthropic-client";
import { parseJsonSafely } from "./json-parser";

/**
 * Standard text generation powered by Anthropic claude-haiku-5-5.
 */
export async function generateWithHaiku(
  systemPrompt: string,
  userPrompt: string,
  options?: AnthropicGenerateOptions
): Promise<string> {
  return generateAnthropicText(systemPrompt, userPrompt, {
    model: DEFAULT_ANTHROPIC_MODEL,
    temperature: options?.temperature ?? 0.7,
    maxTokens: options?.maxTokens ?? 4096,
    ...options
  });
}

/**
 * Structured JSON generation powered by Anthropic claude-haiku-5-5 with safe extraction.
 */
export async function generateJsonWithHaiku<T>(
  systemPrompt: string,
  userPrompt: string,
  schema?: z.ZodType<T>,
  options?: AnthropicGenerateOptions
): Promise<T> {
  const rawText = await generateWithHaiku(systemPrompt, userPrompt, options);
  const result = parseJsonSafely<T>(rawText, schema);

  if (!result.success) {
    throw new Error(`Failed to parse structured model response: ${result.error}`);
  }

  return result.data;
}

/**
 * Backward compatibility: Aliased to Claude Haiku 5.5
 */
export async function generateWithGemini(
  systemPrompt: string,
  userPrompt: string,
  options?: AnthropicGenerateOptions
): Promise<string> {
  return generateWithHaiku(systemPrompt, userPrompt, options);
}

/**
 * Backward compatibility: Aliased to Claude Haiku 5.5 for validator agent
 */
export async function generateWithValidator(
  systemPrompt: string,
  userPrompt: string,
  options?: AnthropicGenerateOptions
): Promise<string> {
  return generateWithHaiku(systemPrompt, userPrompt, {
    temperature: options?.temperature ?? 0.1,
    maxTokens: options?.maxTokens ?? 4096,
    ...options
  });
}
