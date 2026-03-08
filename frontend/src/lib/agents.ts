export interface Agent {
  id: string;
  name: string;
  title: string;
  icon: string;
  engine: "langgraph" | "crewai";
  status: "online" | "working" | "offline" | "error";
  lastActivity?: string;
  currentTask?: string;
}

export const AGENTS: Agent[] = [
  {
    id: "archer",
    name: "Archer",
    title: "Lead Hunter",
    icon: "🎯",
    engine: "langgraph",
    status: "online",
  },
  {
    id: "nova",
    name: "Nova",
    title: "Sales Closer",
    icon: "⚡",
    engine: "langgraph",
    status: "online",
  },
  {
    id: "scout",
    name: "Scout",
    title: "Research Analyst",
    icon: "🔍",
    engine: "crewai",
    status: "online",
  },
  {
    id: "echo",
    name: "Echo",
    title: "Content Writer",
    icon: "✍️",
    engine: "crewai",
    status: "online",
  },
  {
    id: "atlas",
    name: "Atlas",
    title: "Co-Founder & Strategist",
    icon: "🧠",
    engine: "langgraph",
    status: "online",
  },
  {
    id: "sentinel",
    name: "Sentinel",
    title: "Ops & Monitor",
    icon: "🛡️",
    engine: "crewai",
    status: "online",
  },
];

export interface ChatMessage {
  id: string;
  agentId?: string;
  agentName?: string;
  agentTitle?: string;
  agentIcon?: string;
  role: "user" | "agent" | "system";
  content: string;
  timestamp: string;
  type?: "message" | "typing" | "proactive" | "error" | "status";
  metadata?: Record<string, unknown>;
}

export const API_BASE = "http://localhost:8000";
export const WS_BASE = "ws://localhost:8000";

// NullClaw agent instances (when deployed)
// Each agent runs as its own 678KB NullClaw binary on a dedicated port
export const NULLCLAW_PORTS: Record<string, number> = {
  archer: 3010,
  nova: 3011,
  scout: 3012,
  echo: 3013,
  atlas: 3014,
  sentinel: 3015,
};

// Use NullClaw endpoints when available, otherwise fall back to Python gateway
export const USE_NULLCLAW = false;

export function getAgentEndpoint(agentId: string): string {
  if (USE_NULLCLAW && NULLCLAW_PORTS[agentId]) {
    const host = process.env.NEXT_PUBLIC_NULLCLAW_HOST || "http://localhost";
    return `${host}:${NULLCLAW_PORTS[agentId]}`;
  }
  return API_BASE;
}

