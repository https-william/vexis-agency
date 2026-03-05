# Vexis Agency — AI Automation Dashboard

A Multi-Agent System (MAS) that combines 15+ open-source tools into a unified AI agency dashboard.

## Architecture

- **Backend**: FastAPI gateway routing to LangGraph/CrewAI agents via Groq
- **Frontend**: Next.js dashboard with real-time WebSocket agent chat
- **Automation**: n8n workflow engine for WhatsApp/email via Chatwoot/Mautic
- **Infrastructure**: Docker Compose orchestration on Oracle Cloud Always Free

## Agents

| Name | Title | Engine |
|------|-------|--------|
| 🎯 Archer | Lead Hunter | LangGraph |
| ⚡ Nova | Sales Closer | LangGraph |
| 🔍 Scout | Research Analyst | CrewAI |
| ✍️ Echo | Content Writer | CrewAI |
| 🧠 Atlas | Co-Founder & Strategist | LangGraph |
| 🛡️ Sentinel | Ops & Monitor | CrewAI |

## Quick Start

```bash
# 1. Copy env and add your Groq keys
cp .env.example .env

# 2. Start backend services
docker compose up -d

# 3. Start frontend
cd frontend && npm run dev
```

## Project Structure

```
vexis-agency/
├── docker-compose.yml      # All services
├── .env.example             # Configuration template
├── gateway/                 # FastAPI API gateway
│   ├── main.py              # Endpoints, WebSocket, agent registry
│   ├── rate_limiter.py      # Groq key rotation
│   ├── config.py            # Settings
│   ├── Dockerfile
│   └── requirements.txt
└── frontend/                # Next.js dashboard
    └── src/
        ├── app/page.tsx     # Main dashboard
        ├── components/      # AgentSidebar, ChatPanel
        └── lib/agents.ts    # Agent definitions
```
