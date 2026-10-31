# AI Architect

An intelligent, multi-agent system that designs realistic and robust system architectures through structured AI collaboration. Describe your project requirements, and four specialized agents powered by Anthropic's **`claude-haiku-5-5`** will research, orchestrate, validate, and visualize your technical architecture.

[![Demo](https://img.shields.io/badge/Watch%20Demo-Loom-625DF5)](https://www.loom.com/share/2a933a20458d4ff9a21944f3443e6653)
<img width="1379" height="871" alt="System Design Architect Architecture" src="https://github.com/user-attachments/assets/1231094a-d907-4132-be16-76dde202b77c" />

---

## Multi-Agent Architecture

The system coordinates four specialized agents, all unified under Anthropic Claude Haiku 5.5:

```
               ┌────────────────────────────────────────────────────────┐
               │                      User Input                        │
               └──────────────────────────┬─────────────────────────────┘
                                          │
                                          ▼
                         ┌─────────────────────────────────┐
                         │      Agent B (Orchestrator)     │
                         │      "claude-haiku-5-5"         │
                         └──────────────┬──────────────────┘
                                        │
             ┌──────────────────────────┼──────────────────────────┐
             ▼                          ▼                          ▼
  ┌───────────────────────┐  ┌───────────────────────┐  ┌───────────────────────┐
  │   Agent A (Research)  │  │   Agent D (Validator) │  │    Agent C (Canvas)   │
  │   "claude-haiku-5-5"  │  │   "claude-haiku-5-5"  │  │   "claude-haiku-5-5"  │
  │   + Exa Web Search    │  │   Pragmatic Review    │  │   Interactive Graph   │
  └───────────────────────┘  └───────────────────────┘  └───────────────────────┘
```

### Agent Roles & Collaboration

- **Agent B (Architect / Orchestrator)**: Gathers functional requirements (4–5 targeted questions for new designs, 1–5 for follow-ups), triggers technology research, applies validator feedback, and constructs the core architectural plan.
- **Agent A (Technical Researcher)**: Investigates modern, production-proven technologies using Exa Search and Claude Haiku with automatic fallback to internal architectural knowledge.
- **Agent D (The Principal Architect / Validator)**: Validates proposed architectures with a pragmatic, realistic philosophy (KISS principle). It rejects unnecessary over-engineering and approves sound designs while intercepting genuine security flaws or broken flows.
- **Agent C (Canvas Diagram Generator)**: Converts validated architectural plans into interactive visual node graphs with hierarchical positioning (external, gateway, backend/queue, database/cache) for React Flow.

---

## Key Features & Guardrails

- **Unified Claude Haiku 5.5 Engine**: All agents operate on Anthropic's `claude-haiku-5-5` via the `@anthropic-ai/sdk`.
- **System Design Guardrails**: Hardened prompts restrict agent scope exclusively to technical system architecture, with zero tolerance for malware, exploit creation, or non-architecture tasks.
- **Realistic & Uncomplicated Architecture**: Discourages premature over-engineering (e.g. premature multi-region clusters or sprawling microservices), favoring production-practical stacks (3–6 cohesive components).
- **Interactive Visual Canvas**: Automatically generated React Flow graph with custom node types, icons, animated data flows, and PNG export.
- **Resilient Fallbacks**: Safe JSON boundary extraction (`json-parser.ts`), exponential backoff retries, and diagram node-integrity verification.

---

## Tech Stack

- **Framework**: Next.js 16 (App Router) & React 19
- **AI SDK**: Official Anthropic SDK (`@anthropic-ai/sdk`)
- **LLM Model**: `claude-haiku-5-5` across all agents
- **Web Search**: Exa Search API (`api.exa.ai`)
- **Diagrams & Visuals**: React Flow (`@xyflow/react`)
- **Styling**: Tailwind CSS 4 + Framer Motion
- **Validation**: Zod schema validation

---

## Getting Started

### Prerequisites

- Node.js 18+ (tested on Node 20 & 24)
- [Anthropic API Key](https://console.anthropic.com/)
- [Exa Search API Key](https://exa.ai) (optional, for web research)

### Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/sundaram2021/system-design-architect.git
   cd system-design-architect
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Create a `.env.local` file:
   ```bash
   cp .env.example .env.local
   ```
   Add your keys:
   ```env
   ANTHROPIC_API_KEY=your_anthropic_api_key
   ANTHROPIC_MODEL=claude-haiku-5-5
   EXA_API_KEY=your_exa_api_key
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Build and Test**:
   ```bash
   npm run build
   node scripts/test-agents.mjs
   ```

---

## Project Structure

```
app/
├── actions.ts                  # Next.js Server Actions for agent execution
├── lib/
│   ├── agents/
│   │   ├── agent-a.ts          # Agent A (Technical Researcher)
│   │   ├── agent-b.ts          # Agent B (Architect / Orchestrator)
│   │   ├── agent-b-context.ts  # Conversation context builder
│   │   ├── agent-c.ts          # Agent C (Canvas Diagram Generator)
│   │   ├── agent-d.ts          # Agent D (Pragmatic Validator)
│   │   ├── prompts/            # Modular agent prompts & guardrails
│   │   │   ├── guardrails.ts   # Universal system design boundaries
│   │   │   ├── agent-a-prompt.ts
│   │   │   ├── agent-b-prompt.ts
│   │   │   ├── agent-c-prompt.ts
│   │   │   └── agent-d-prompt.ts
│   │   └── prompts.ts          # Prompt exports barrel
│   ├── services/
│   │   ├── anthropic-client.ts # Anthropic SDK client & retry logic
│   │   ├── ai-service.ts       # Agent AI service interface
│   │   ├── json-parser.ts      # Resilient JSON extractor & parser
│   │   └── exa-service.ts      # Exa search integration
│   ├── schemas/                # Zod schemas for agents and canvas
│   └── context/                # React state management
└── components/                 # UI components (Canvas, Chat, Modals)
```

---

## Coding Standards

- **SOLID & DRY**: Single-responsibility services, modular prompt definitions, and shared JSON sanitization utilities.
- **Strict File Limit**: Every codebase file is strictly maintained under 200 lines for maximum maintainability.
- **Type Safety**: End-to-end typed contracts with Zod validation.
