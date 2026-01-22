import { searchAndSummarize } from "../services/exa-service";
import { generateWithGemini } from "../services/gemini-service";
import { AGENT_A_SUMMARY_PROMPT } from "./prompts";
import { AgentAResearchResultSchema, type AgentAResearchResult } from "../schemas";

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

  const summaryResponse = await generateWithGemini(
    AGENT_A_SUMMARY_PROMPT,
    summaryPrompt,
    { temperature: 0.3 }
  );

  let parsed;
  try {
    parsed = JSON.parse(summaryResponse);
  } catch {
    parsed = {
      summary: "Unable to parse research summary.",
      recommendation: "Please review the sources directly."
    };
  }

  return {
    sources,
    summary: parsed.summary || "No summary available.",
    recommendation: parsed.recommendation || "No recommendation available."
  };
}
