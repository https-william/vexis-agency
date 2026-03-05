"""
Vexis Agency — Lead Pipeline

The full lead extraction pipeline that chains:
    Google Maps scraper → Website analyzer → Prospect research → Lead scoring

This is the end-to-end flow when Archer is asked to "find leads":

    1. Search Google Maps for businesses matching niche + location
    2. Analyze each business's website (if they have one)
    3. Run gap analysis (no website, bad reviews, no SEO, etc.)
    4. Score and rank leads by outreach potential
    5. Package results for Archer to present to the user
    6. Optionally hand off high-score leads to Scout for deep research

Usage:
    pipeline = LeadPipeline()
    results = await pipeline.run("law firms", "Lagos, Nigeria")
    print(results.summary)      # Human-readable summary
    print(results.csv)          # CSV export
    print(results.high_score)   # Leads scoring 7+
"""

import asyncio
import json
import logging
from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional

from scraping.google_maps import GoogleMapsScraper, Lead
from scraping.prospect_research import WebsiteAnalyzer
from scraping.browser_automation import BrowserAutomation

logger = logging.getLogger("vexis.scraping.pipeline")


@dataclass
class PipelineResult:
    """Complete output of a lead extraction run."""
    query: str
    niche: str
    location: str
    leads: list[Lead] = field(default_factory=list)
    total_found: int = 0
    high_score_count: int = 0
    no_website_count: int = 0
    low_rating_count: int = 0
    summary: str = ""
    csv: str = ""
    timestamp: str = ""
    duration_seconds: float = 0.0

    @property
    def high_score(self) -> list[Lead]:
        """Get leads scoring 7 or higher."""
        return [l for l in self.leads if l.score >= 7.0]


class LeadPipeline:
    """
    End-to-end lead extraction pipeline.
    
    Chains: Maps search → Website analysis → Gap analysis → Scoring → Packaging
    
    Usage:
        pipeline = LeadPipeline()
        results = await pipeline.run("law firms", "Lagos, Nigeria", max_leads=20)
    """

    def __init__(self):
        self._maps_scraper = GoogleMapsScraper()
        self._website_analyzer = WebsiteAnalyzer()
        self._browser = BrowserAutomation()

    async def run(
        self,
        niche: str,
        location: str,
        max_leads: int = 20,
        analyze_websites: bool = True,
    ) -> PipelineResult:
        """
        Execute the full lead extraction pipeline.
        
        Args:
            niche: Business type to search for
            location: Geographic location
            max_leads: Maximum leads to process
            analyze_websites: Whether to analyze each lead's website
            
        Returns:
            PipelineResult with scored leads, summary, and CSV
        """
        start = datetime.utcnow()
        logger.info(f"🚀 Pipeline started: {niche} in {location}")

        result = PipelineResult(
            query=f"{niche} in {location}",
            niche=niche,
            location=location,
            timestamp=start.isoformat(),
        )

        # Step 1: Search Google Maps
        logger.info("Step 1/4: Searching Google Maps...")
        raw_leads = await self._maps_scraper.search(niche, location, max_results=max_leads)

        if not raw_leads:
            result.summary = f"No businesses found for '{niche}' in '{location}'. Try a different niche or location."
            return result

        # Step 2: Analyze websites (if enabled)
        if analyze_websites:
            logger.info("Step 2/4: Analyzing websites...")
            raw_leads = await self._enrich_with_website_data(raw_leads)
        else:
            logger.info("Step 2/4: Skipping website analysis")

        # Step 3: Gap analysis
        logger.info("Step 3/4: Running gap analysis...")
        analyzed_leads = self._maps_scraper.analyze_gaps(raw_leads)

        # Step 4: Score and rank
        logger.info("Step 4/4: Scoring and ranking leads...")
        scored_leads = self._maps_scraper.score_leads(analyzed_leads)

        # Package results
        result.leads = scored_leads
        result.total_found = len(scored_leads)
        result.high_score_count = len([l for l in scored_leads if l.score >= 7.0])
        result.no_website_count = len([l for l in scored_leads if "no_website" in l.gaps])
        result.low_rating_count = len([l for l in scored_leads if "low_rating" in l.gaps])
        result.summary = self._maps_scraper.summarize(scored_leads)
        result.csv = self._maps_scraper.to_csv_string(scored_leads)
        result.duration_seconds = (datetime.utcnow() - start).total_seconds()

        logger.info(
            f"✅ Pipeline complete: {result.total_found} leads, "
            f"{result.high_score_count} high-score, "
            f"{result.duration_seconds:.1f}s"
        )

        return result

    async def _enrich_with_website_data(self, leads: list[Lead]) -> list[Lead]:
        """
        Analyze each lead's website for additional data.
        Runs website checks concurrently for speed.
        """
        tasks = []
        for lead in leads:
            if lead.website and "placeholder" not in lead.website:
                tasks.append(self._analyze_lead_website(lead))

        if tasks:
            await asyncio.gather(*tasks, return_exceptions=True)

        return leads

    async def _analyze_lead_website(self, lead: Lead) -> None:
        """Analyze a single lead's website and update the lead object."""
        try:
            contact_info = await self._browser.extract_contact_info(lead.website)

            # Update lead with discovered info
            if contact_info.get("emails") and not lead.email:
                lead.email = contact_info["emails"][0]

            if contact_info.get("phones") and not lead.phone:
                lead.phone = contact_info["phones"][0]

        except Exception as e:
            logger.debug(f"Website analysis failed for {lead.name}: {e}")

    async def quick_scan(self, niche: str, location: str) -> str:
        """
        Quick scan — return just the summary without website analysis.
        Faster for initial discovery.
        """
        result = await self.run(
            niche, location,
            max_leads=10,
            analyze_websites=False,
        )
        return result.summary

    def export_for_nova(self, result: PipelineResult) -> list[dict]:
        """
        Format high-score leads for Nova's outreach pipeline.
        
        Returns a list of prospect dicts ready for outreach:
        [
            {
                "name": "ABC Law",
                "contact": "+234...",
                "gaps": ["no_website"],
                "pitch_angle": "website creation",
                "priority": "high"
            }
        ]
        """
        prospects = []
        for lead in result.high_score:
            # Determine best pitch angle from gaps
            if "no_website" in lead.gaps:
                pitch = "website creation + online presence"
            elif "low_rating" in lead.gaps:
                pitch = "reputation management + review generation"
            elif "outdated_website" in lead.gaps:
                pitch = "website redesign + modernization"
            elif "few_reviews" in lead.gaps:
                pitch = "SEO + Google reviews strategy"
            else:
                pitch = "digital presence audit + growth strategy"

            prospects.append({
                "name": lead.name,
                "address": lead.address,
                "contact": lead.phone or lead.email or "No contact info",
                "website": lead.website or "None",
                "rating": lead.rating,
                "gaps": lead.gaps,
                "score": lead.score,
                "pitch_angle": pitch,
                "priority": "high" if lead.score >= 8 else "medium",
            })

        return prospects
