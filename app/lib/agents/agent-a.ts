import { searchAndSummarize } from "../services/exa-service";
import { generateWithHaiku } from "../services/ai-service";
import { parseJsonSafely } from "../services/json-parser";
import { AGENT_A_SUMMARY_PROMPT } from "./prompts";
import type { AgentAResearchResult } from "../schemas/agent-responses";

interface AgentASummaryResponse {
  summary?: string;
  recommendation?: string;
}

export async function performResearch(
  query: string,
  context: string
): Promise<AgentAResearchResult> {
  const { sources, rawResults } = await searchAndSummarize(query, context);

  const combinedText = rawResults
    .map((r, i) => `Source ${i + 1}: ${r.title}\n${r.text.substring(0, 500)}`)
    .join("\n\n");

  const summaryPrompt = `Research Query: "${query}"
Context: ${context}

Search Results:
${combinedText}

Analyze these results and provide a summary and recommendation.`;

  const summaryResponse = await generateWithHaiku(
    AGENT_A_SUMMARY_PROMPT,
    summaryPrompt,
    { temperature: 0.3 }
  );

  const parsed = parseJsonSafely<AgentASummaryResponse>(summaryResponse);
  const data = parsed.success ? parsed.data : {};

  return {
    sources,
    summary: data.summary || "No summary available.",
    recommendation: data.recommendation || "No recommendation available."
  };
}
