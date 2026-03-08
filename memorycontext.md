# Vexis Agency - Project Memory Context

## Project Overview
Vexis Agency is an AI-powered autonomous workforce platform. It features a stunning, premium "Apple x Google" 3D glassmorphic UI, and under the hood, it orchestrates an elite fleet of 6 specialized AI agents (Archer, Nova, Scout, Echo, Atlas, Sentinel). The agents are designed to handle everything from lead generation to closing deals autonomously.

## Architecture
- **Frontend**: Next.js 16 (App Router), React, Tailwind CSS. Located in `frontend/`. Custom UI components with heavy use of glassmorphism, gradients, and sleek typography.
- **Backend / Agent Core**: The final goal is to use **NullClaw**, a high-performance Zig-based agent runtime. Each agent runs as an independent, lightweight binary (~678KB) communicating directly with LLMs (Provider: Groq) locally via Docker.
- **Fallback Backend**: A Python API gateway exists as a fallback to route chat messages if NullClaw is not active.
- **Database / Auth**: Supabase (PostgreSQL + Auth), though the system has a "Sandbox/Bypass" mode for local UI testing.
- **Integrations**: 
  - **Cal.com**: For scheduling and calendar management.
  - **Documenso**: For digital contract creation and signing.

## Current State & Recent Changes (Phase 13/14)
1. **Frontend**: Next.js 16 (App Router), React, Tailwind CSS. Custom UI components with heavy use of glassmorphism. Split the Chat interface to include a live "Process Feed" showing agent granular logs.
2. **Two-Stage Architecture (Llama 3)**: We paused the NullClaw transition to focus on optimizing the Python Gateway. To solve severe token bloat (413 errors), we implemented a Two-Stage Prompting pipeline:
   - **Stage 1 (Formatter)**: `llama-3.1-8b-instant` pre-processes the user message, memory context, and history into a clean "Execution Directive".
   - **Stage 2 (Reasoning Engine)**: `llama-3.3-70b-versatile` receives the pristine directive and executes tools securely.
3. **Triple-Layer Token Protection**: Implemented history pruning in the gateway, double-injection removal, and mid-loop context summarization within LangGraph tool chains to keep TPM low.
4. **Agent Handoffs Fixed**: We fixed a state closure bug in `handleSendMessage` by adding an `agentOverride` parameter. "Forward to Scout" now successfully switches the thread context, UI, and Supabase database tracking.

## Next Steps Upon Resuming
1. **Live Agency Testing**: Both the Python Gateway (`uvicorn main:app`) and the Next.js `dev` server have been freshly restarted. We can now test complex requests with Archer and Nova to book our first client.
2. **Integrations**: The "Calendar" and "Contracts" tabs in the Dashboard use iframe embeds for Cal.com and Documenso. Environment variables (`NEXT_PUBLIC_CALCOM_URL` and `NEXT_PUBLIC_DOCUMENSO_URL`) may still need configuring if we are to use them fully.
3. **Future (NullClaw)**: If we ever choose to return to the Zig-based runtime, the binaries and `docker-compose.nullclaw.yml` are ready for a Docker host.
