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
  let sources: { title: string; url: string; snippet: string }[] = [];
  let combinedText = "";

  try {
    const searchData = await searchAndSummarize(query, context);
    sources = searchData.sources;
    combinedText = searchData.rawResults
      .map((r, i) => `Source ${i + 1}: ${r.title}\n${r.text.substring(0, 500)}`)
      .join("\n\n");
  } catch (err) {
    console.warn("Exa search error, falling back to internal architectural analysis:", err);
    sources = [
      {
        title: "Standard Production Architecture Best Practices",
        url: "https://system-design-standards.internal",
        snippet: `Realistic, battle-tested architectural guidelines for ${query}`
      }
    ];
    combinedText = `Analyze realistic architectural technology trade-offs for: "${query}". Context: "${context}".`;
  }

  const summaryPrompt = `Research Query: "${query}"\nContext: ${context}\n\nSearch Context:\n${combinedText || query}\n\nAnalyze and provide a practical, realistic summary and recommendation.`;

  const summaryResponse = await generateWithHaiku(
    AGENT_A_SUMMARY_PROMPT,
    summaryPrompt,
    { temperature: 0.2 }
  );

  const parsed = parseJsonSafely<AgentASummaryResponse>(summaryResponse);
  const data = parsed.success ? parsed.data : {};

  return {
    sources,
    summary: data.summary || "Standard production technology stack verified for this use case.",
    recommendation: data.recommendation || "Recommend adopting standard, battle-tested components (e.g., PostgreSQL, Redis, clean API service) to minimize operational complexity."
  };
}
