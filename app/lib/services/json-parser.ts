import { z } from "zod";

/**
 * Extracts and sanitizes raw JSON text from a model response.
 * Strips markdown code blocks and isolates valid JSON boundaries.
 */
export function extractJson(text: string): string {
  if (!text) return "";

  const trimmed = text.trim();

  // Handle markdown code blocks ```json ... ``` or ``` ... ```
  const codeBlockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (codeBlockMatch && codeBlockMatch[1]) {
    return codeBlockMatch[1].trim();
  }

  // Find first opening brace/bracket and last closing brace/bracket
  const firstBrace = trimmed.indexOf("{");
  const firstBracket = trimmed.indexOf("[");

  let startIdx = -1;
  let endIdx = -1;

  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    startIdx = firstBrace;
    endIdx = trimmed.lastIndexOf("}");
  } else if (firstBracket !== -1) {
    startIdx = firstBracket;
    endIdx = trimmed.lastIndexOf("]");
  }

  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    return trimmed.substring(startIdx, endIdx + 1).trim();
  }

  return trimmed;
}

/**
 * Safely parses raw text as JSON, optionally validating against a Zod schema.
 */
export function parseJsonSafely<T>(
  rawText: string,
  schema?: z.ZodType<T>
): { success: true; data: T } | { success: false; error: string } {
  try {
    const cleaned = extractJson(rawText);
    const parsed = JSON.parse(cleaned);

    if (schema) {
      const validation = schema.safeParse(parsed);
      if (!validation.success) {
        return {
          success: false,
          error: `Schema validation failed: ${validation.error.message}`
        };
      }
      return { success: true, data: validation.data };
    }

    return { success: true, data: parsed as T };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to parse JSON"
    };
  }
}

