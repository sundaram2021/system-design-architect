import { NextResponse } from "next/server";
import { performResearch } from "@/app/lib/agents/agent-a";

export async function POST(request: Request) {
  try {
    const { query, context } = await request.json();

    if (!query) {
      return NextResponse.json(
        { error: "Query is required" },
        { status: 400 }
      );
    }

    const result = await performResearch(query, context || "");

    return NextResponse.json(result);
  } catch (error) {
    console.error("Research API error:", error);
    return NextResponse.json(
      { error: "Failed to perform research" },
      { status: 500 }
    );
  }
}
