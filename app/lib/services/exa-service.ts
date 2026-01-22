interface ExaSearchResult {
  title: string;
  url: string;
  text: string;
  publishedDate?: string;
}

interface ExaSearchResponse {
  results: ExaSearchResult[];
}

export async function searchExa(
  query: string,
  options?: {
    numResults?: number;
    type?: "keyword" | "neural";
  }
): Promise<ExaSearchResult[]> {
  const response = await fetch("https://api.exa.ai/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.EXA_API_KEY || ""
    },
    body: JSON.stringify({
      query,
      numResults: options?.numResults ?? 5,
      type: options?.type ?? "neural",
      useAutoprompt: true,
      contents: {
        text: true
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Exa API error: ${response.status}`);
  }

  const data: ExaSearchResponse = await response.json();
  return data.results;
}

export async function searchAndSummarize(
  query: string,
  context: string
): Promise<{
  sources: { title: string; url: string; snippet: string }[];
  rawResults: ExaSearchResult[];
}> {
  const results = await searchExa(query, { numResults: 5 });
  
  const sources = results.map((r) => ({
    title: r.title,
    url: r.url,
    snippet: r.text.substring(0, 300) + "..."
  }));

  return {
    sources,
    rawResults: results
  };
}
