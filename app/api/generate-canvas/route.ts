import { NextResponse } from "next/server";
import { generateCanvas } from "@/app/lib/agents/agent-c";
import type { Plan } from "@/app/lib/schemas";

export async function POST(request: Request) {
  try {
    const { plan } = await request.json();

    if (!plan) {
      return NextResponse.json(
        { error: "Plan is required" },
        { status: 400 }
      );
    }

    const result = await generateCanvas(plan as Plan);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Generate canvas API error:", error);
    return NextResponse.json(
      { error: "Failed to generate canvas" },
      { status: 500 }
    );
  }
}
