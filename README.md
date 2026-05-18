# AI Architect

An intelligent multi-agent system that designs system architectures through conversation. Describe your project requirements, and AI agents collaborate to research, validate, and generate a visual architecture diagram.

[![Demo](https://img.shields.io/badge/Watch%20Demo-Loom-625DF5)](https://www.loom.com/share/2a933a20458d4ff9a21944f3443e6653)

## Features

- **Agentic Architecture Design** - Multi-agent system with specialized roles: Researcher (Agent A), Orchestrator (Agent B), Canvas Generator (Agent C), and Validator (Agent D)
- **Conversational Requirement Gathering** - Agent B asks targeted questions to understand your project scope, scale, and constraints
- **Web Research** - Agent A searches the web via Exa API to recommend optimal technologies and patterns
- **Plan Validation** - Agent D reviews the architectural plan for consistency, completeness, and best practices before visualization
- **Interactive Canvas** - Generates a React Flow visualization of the architecture with nodes, edges, and component relationships
- **Export Support** - Export diagrams as PNG images
- **Edit & Iterate** - Request changes to the generated plan and regenerate the canvas

## How It Works

```
User Input
    │
    ▼
Agent B (Orchestrator) ─── Gemini 2.0 Flash ──► Asks questions / Requests research
    │
    ├── Agent A (Research) ─── Gemini 2.0 Flash + Exa Search ──► Fetches & summarizes
    │
    ├── Agent D (Validator) ─── DeepSeek V4 Flash ──► Reviews & approves plan
    │
    └── Agent C (Canvas) ─── Gemini 2.0 Flash ──► Generates visual diagram
```

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **AI SDK**: [Vercel AI SDK](https://sdk.vercel.ai) with `@ai-sdk/google` and `@ai-sdk/openai` providers
- **Models**: `google/gemini-2.0-flash` (Agents A, B, C) and `deepseek/deepseek-v4-flash` (Agent D)
- **Visualization**: React Flow (`@xyflow/react`)
- **Styling**: Tailwind CSS 4 + Framer Motion

## Getting Started

### Prerequisites

- Node.js 18+
- API keys for:
  - [Vercel AI Gateway](https://vercel.com/d?to=%2F%5Bteam%5D%2F%7E%2Fai%2Fapi-keys) (single key for all models)
  - [Exa](https://exa.ai) (web search)

### Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the environment file and add your API keys:
   ```bash
   cp .env.example .env.local
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000)

### Environment Variables

| Variable | Description |
|---|---|
| `AI_GATEWAY_API_KEY` | Vercel AI Gateway API key (all AI models) |
| `EXA_API_KEY` | Exa search API key (Agent A research) |

## Project Structure

```
app/
├── lib/
│   ├── agents/       # AI agent logic (A: research, B: orchestrator, C: canvas, D: validator)
│   ├── services/     # AI service layer (Vercel AI SDK integration, Exa search)
│   ├── schemas/      # Zod schemas for data validation
│   └── context/      # React context & reducer for state management
└── components/       # UI components (chat, canvas, modals)
```
