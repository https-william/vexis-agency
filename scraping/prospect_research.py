"""
Vexis Agency — Prospect Research Engine

Uses Perplexica (self-hosted AI search) for deep-dive research on companies.
This is Scout's primary tool.

Architecture:
    Perplexica runs as a Docker container (port 3001).
    We query its API endpoint for structured search results.
    Falls back to direct web search via httpx if Perplexica is unavailable.

Output format:
    {
        "company": "TechCorp Inc.",
        "overview": "...",
        "key_people": [...],
        "tech_stack": [...],
        "competitors": [...],
        "opportunities": [...],
        "risks": [...],
        "confidence": "high",
        "sources": [...]
    }
"""

import asyncio
import json
import logging
from dataclasses import dataclass, field, asdict
from typing import Optional

import httpx

logger = logging.getLogger("vexis.scraping.research")


@dataclass
class ResearchBrief:
    """Structured research output for Scout."""
    company_name: str
    overview: str = ""
    industry: str = ""
    location: str = ""
    website: str = ""
    estimated_size: str = ""
    key_people: list[dict] = field(default_factory=list)
    tech_stack: list[str] = field(default_factory=list)
    competitors: list[str] = field(default_factory=list)
    opportunities: list[str] = field(default_factory=list)
    risks: list[str] = field(default_factory=list)
    social_media: dict = field(default_factory=dict)
    confidence: str = "medium"  # high / medium / low
    sources: list[str] = field(default_factory=list)
    raw_data: str = ""

    def to_dict(self) -> dict:
        return asdict(self)

    def to_markdown(self) -> str:
        """Format as a structured research brief for human consumption."""
        sections = [f"# Research Brief — {self.company_name}\n"]

        # Overview
        sections.append(f"## Overview\n{self.overview}\n")

        if self.industry:
            sections.append(f"**Industry:** {self.industry}")
        if self.location:
            sections.append(f"**Location:** {self.location}")
        if self.website:
            sections.append(f"**Website:** {self.website}")
        if self.estimated_size:
            sections.append(f"**Est. Size:** {self.estimated_size}")

        # Key People
        if self.key_people:
            sections.append("\n## Key People")
            for person in self.key_people:
                name = person.get("name", "Unknown")
                role = person.get("role", "")
                linkedin = person.get("linkedin", "")
                line = f"- **{name}** — {role}"
                if linkedin:
                    line += f" ([LinkedIn]({linkedin}))"
                sections.append(line)

        # Tech Stack
        if self.tech_stack:
            sections.append("\n## Tech Stack")
            sections.append(", ".join(self.tech_stack))

        # Opportunities
        if self.opportunities:
            sections.append("\n## 💡 Opportunities")
            for opp in self.opportunities:
                sections.append(f"- {opp}")

        # Risks
        if self.risks:
            sections.append("\n## ⚠️ Risks")
            for risk in self.risks:
                sections.append(f"- {risk}")

        # Confidence
        confidence_emoji = {"high": "🟢", "medium": "🟡", "low": "🔴"}.get(self.confidence, "⚪")
        sections.append(f"\n**Confidence Level:** {confidence_emoji} {self.confidence.title()}")

        # Sources
        if self.sources:
            sections.append("\n## Sources")
            for src in self.sources:
                sections.append(f"- {src}")

        return "\n".join(sections)


class ProspectResearcher:
    """
    Deep-dive research on companies and prospects.
    
    Uses Perplexica for AI-powered search, with fallback to direct web search.
    
    Usage:
        researcher = ProspectResearcher(perplexica_url="http://localhost:3001")
        brief = await researcher.research("TechCorp Inc.")
    """

    def __init__(self, perplexica_url: str = "http://localhost:3001"):
        self._perplexica_url = perplexica_url
        self._headers = {
            "Content-Type": "application/json",
            "User-Agent": "Vexis-Scout/1.0",
        }

    async def research(self, company_name: str, context: str = "") -> ResearchBrief:
        """
        Perform comprehensive research on a company.
        
        Args:
            company_name: Name of the company to research
            context: Additional context (industry, location, etc.)
            
        Returns:
            Structured ResearchBrief
        """
        logger.info(f"Starting research on: {company_name}")

        brief = ResearchBrief(company_name=company_name)
        search_results = []

        # Try Perplexica first, fall back to direct search
        try:
            search_results = await self._perplexica_search(
                f"{company_name} company overview industry {context}"
            )
        except Exception as e:
            logger.warning(f"Perplexica unavailable: {e}. Using fallback search.")
            search_results = await self._fallback_search(company_name, context)

        # Process results into structured brief
        if search_results:
            brief = self._process_results(company_name, search_results)

        logger.info(f"Research complete: {company_name} — confidence: {brief.confidence}")
        return brief

    async def _perplexica_search(self, query: str) -> list[dict]:
        """
        Query Perplexica for AI-powered search results.
        
        Perplexica provides structured, source-cited answers.
        """
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{self._perplexica_url}/api/search",
                json={
                    "query": query,
                    "focus_mode": "webSearch",
                    "optimization_mode": "balanced",
                },
                headers=self._headers,
            )

            if response.status_code != 200:
                raise ConnectionError(f"Perplexica returned {response.status_code}")

            data = response.json()
            return data.get("results", [])

    async def _fallback_search(self, company_name: str, context: str = "") -> list[dict]:
        """
        Fallback web search when Perplexica is unavailable.
        Uses DuckDuckGo instant answer API (no API key needed).
        """
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.get(
                    "https://api.duckduckgo.com/",
                    params={
                        "q": f"{company_name} company {context}",
                        "format": "json",
                        "no_redirect": 1,
                    },
                )

                if response.status_code == 200:
                    data = response.json()
                    results = []

                    if data.get("Abstract"):
                        results.append({
                            "title": company_name,
                            "content": data["Abstract"],
                            "url": data.get("AbstractURL", ""),
                            "source": "DuckDuckGo",
                        })

                    for topic in data.get("RelatedTopics", [])[:5]:
                        if isinstance(topic, dict) and "Text" in topic:
                            results.append({
                                "title": topic.get("Text", "")[:80],
                                "content": topic.get("Text", ""),
                                "url": topic.get("FirstURL", ""),
                                "source": "DuckDuckGo",
                            })

                    return results

        except Exception as e:
            logger.warning(f"DuckDuckGo fallback also failed: {e}")

        # Ultimate fallback: return empty (Scout will note low confidence)
        return []

    def _process_results(self, company_name: str, results: list[dict]) -> ResearchBrief:
        """Process raw search results into a structured ResearchBrief."""
        brief = ResearchBrief(company_name=company_name)

        # Combine all content
        all_content = " ".join(r.get("content", "") for r in results).lower()
        brief.raw_data = all_content[:2000]
        brief.sources = [r.get("url", "") for r in results if r.get("url")]

        # Extract overview (first result's content)
        if results:
            brief.overview = results[0].get("content", "No overview available.")

        # Industry detection
        industry_keywords = {
            "technology": ["software", "tech", "saas", "app", "platform", "digital"],
            "law": ["law firm", "legal", "attorney", "lawyer", "litigation"],
            "healthcare": ["health", "medical", "hospital", "clinic", "doctor"],
            "finance": ["bank", "finance", "investment", "insurance", "fintech"],
            "retail": ["shop", "store", "retail", "ecommerce", "e-commerce"],
            "real estate": ["real estate", "property", "realty", "housing"],
            "restaurant": ["restaurant", "food", "cafe", "dining", "catering"],
            "construction": ["construction", "building", "contractor", "architect"],
            "education": ["school", "education", "university", "training", "learning"],
            "marketing": ["marketing", "advertising", "agency", "branding", "media"],
        }

        for industry, keywords in industry_keywords.items():
            if any(kw in all_content for kw in keywords):
                brief.industry = industry.title()
                break

        # Tech stack detection
        tech_indicators = {
            "WordPress": ["wordpress", "wp-content"],
            "Shopify": ["shopify", "myshopify"],
            "Wix": ["wix.com", "wixsite"],
            "Squarespace": ["squarespace"],
            "React": ["reactjs", "react.js", "react app"],
            "Next.js": ["nextjs", "next.js", "vercel"],
            "PHP": ["php", "laravel", "codeigniter"],
            "Python/Django": ["django", "python"],
            "Node.js": ["nodejs", "node.js", "express"],
        }

        for tech, indicators in tech_indicators.items():
            if any(ind in all_content for ind in indicators):
                brief.tech_stack.append(tech)

        # Confidence level
        if len(results) >= 3 and len(brief.overview) > 100:
            brief.confidence = "high"
        elif len(results) >= 1:
            brief.confidence = "medium"
        else:
            brief.confidence = "low"

        # Opportunities (based on gaps)
        if not brief.tech_stack:
            brief.opportunities.append("No detectable tech stack — may need website modernization")
        if "WordPress" in brief.tech_stack:
            brief.opportunities.append("Uses WordPress — potential for migration or optimization")
        if not brief.social_media:
            brief.opportunities.append("Limited social media presence — growth opportunity")

        return brief


class WebsiteAnalyzer:
    """
    Analyze a prospect's website for technical details.
    Used by Scout to supplement research briefs.
    """

    async def analyze(self, url: str) -> dict:
        """Analyze a website for tech stack, performance, and issues."""
        try:
            async with httpx.AsyncClient(
                timeout=15.0,
                follow_redirects=True,
            ) as client:
                response = await client.get(url)

                if response.status_code != 200:
                    return {"error": f"HTTP {response.status_code}", "url": url}

                html = response.text.lower()
                headers = dict(response.headers)

                analysis = {
                    "url": url,
                    "status": response.status_code,
                    "has_ssl": url.startswith("https"),
                    "server": headers.get("server", "unknown"),
                    "tech_hints": [],
                    "issues": [],
                }

                # Tech detection from HTML
                if "wp-content" in html:
                    analysis["tech_hints"].append("WordPress")
                if "shopify" in html:
                    analysis["tech_hints"].append("Shopify")
                if "wix" in html:
                    analysis["tech_hints"].append("Wix")
                if "react" in html or "__next" in html:
                    analysis["tech_hints"].append("React/Next.js")

                # Issue detection
                if not analysis["has_ssl"]:
                    analysis["issues"].append("No SSL/HTTPS — security concern")
                if "viewport" not in html:
                    analysis["issues"].append("Not mobile-responsive")
                if len(html) < 1000:
                    analysis["issues"].append("Very thin content — placeholder or under construction")

                return analysis

        except Exception as e:
            return {"error": str(e), "url": url}
