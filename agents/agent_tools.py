import logging
import json
import asyncio
from typing import Any, Dict, List, Optional
from datetime import datetime
import pytz

from scraping.lead_pipeline import LeadPipeline
from scraping.prospect_research import ProspectResearcher

logger = logging.getLogger("vexis.agent_tools")

# ---------------------------------------------------------------------------
# Tool Implementations
# ---------------------------------------------------------------------------

async def search_leads(niche: str, location: str, max_leads: int = 15) -> str:
    """
    Search for businesses in a specific niche and location.
    Returns a summary of found leads with gap analysis.
    """
    try:
        pipeline = LeadPipeline()
        result = await pipeline.run(
            niche=niche, 
            location=location, 
            max_leads=max_leads, 
            analyze_websites=True
        )
        return result.summary
    except Exception as e:
        logger.error(f"search_leads failed: {e}")
        return f"Error searching for leads: {str(e)}"

async def research_prospect(company_name: str, context: str = "") -> str:
    """
    Perform deep research on a specific company.
    """
    try:
        researcher = ProspectResearcher()
        result = await researcher.research(company_name, context)
        return json.dumps(result, indent=2)
    except Exception as e:
        logger.error(f"research_prospect failed: {e}")
        return f"Error researching company: {str(e)}"

async def perplexica_search(query: str) -> str:
    """
    Perform an AI-powered search using Perplexica.
    Useful for finding specific facts, news, or deep business intelligence.
    """
    try:
        researcher = ProspectResearcher()
        # Call the private method that handles the direct Perplexica API call
        results = await researcher._perplexica_search(query)
        return json.dumps(results, indent=2)
    except Exception as e:
        logger.error(f"perplexica_search failed: {e}")
        return f"Error using Perplexica search: {str(e)}"

async def check_daylight(location: str) -> str:
    """
    Check if it is currently daytime (business hours: 8 AM - 6 PM) in a location.
    Uses fuzzy location matching.
    """
    try:
        # Simple timezone lookup for major countries/cities
        # In a production app, we would use a Geocoding API + Timezone API
        # For now, we'll use a mapping for common lead locations
        tz_map = {
            "usa": "US/Eastern", "us": "US/Eastern", "america": "US/Eastern",
            "uk": "Europe/London", "london": "Europe/London", "britain": "Europe/London",
            "nigeria": "Africa/Lagos", "lagos": "Africa/Lagos",
            "dubai": "Asia/Dubai", "uae": "Asia/Dubai",
            "germany": "Europe/Berlin", "berlin": "Europe/Berlin",
            "australia": "Australia/Sydney", "sydney": "Australia/Sydney",
            "canada": "Canada/Eastern", "toronto": "Canada/Eastern",
        }
        
        loc_lower = location.lower()
        target_tz = None
        for key, tz in tz_map.items():
            if key in loc_lower:
                target_tz = tz
                break
        
        if not target_tz:
            return f"Could not determine timezone for '{location}'. Please try a major city or country."
            
        region_tz = pytz.timezone(target_tz)
        local_time = datetime.now(region_tz)
        is_daylight = 8 <= local_time.hour < 18
        
        return json.dumps({
            "location": location,
            "timezone": target_tz,
            "local_time": local_time.strftime("%I:%M %p"),
            "is_business_hours": is_daylight,
            "status": "Daytime/Open" if is_daylight else "Night/Closed"
        })
    except Exception as e:
        return f"Error checking daylight: {str(e)}"

# ---------------------------------------------------------------------------
# Tool Schemas for Groq (OpenAI-compatible)
# ---------------------------------------------------------------------------

TOOLS_SCHEMA = [
    {
        "type": "function",
        "function": {
            "name": "search_leads",
            "description": "Search for businesses in a specific niche and location. Use this to find leads.",
            "parameters": {
                "type": "object",
                "properties": {
                    "niche": {"type": "string", "description": "Business type (e.g., 'roofing services', 'dentists')"},
                    "location": {"type": "string", "description": "City or Region (e.g., 'London', 'Lagos')"},
                    "max_leads": {"type": "integer", "description": "Number of leads (default 15)"}
                },
                "required": ["niche", "location"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "research_prospect",
            "description": "Perform deep research on a specific company to find intent signals and decision makers.",
            "parameters": {
                "type": "object",
                "properties": {
                    "company_name": {"type": "string", "description": "Name of the business"},
                    "context": {"type": "string", "description": "Any additional info (location, website)"}
                },
                "required": ["company_name"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "perplexica_search",
            "description": "Perform an AI-powered search for facts, news, or deep business intelligence.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "The search query or question"}
                },
                "required": ["query"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "check_daylight",
            "description": "Check if it is currently daytime/business hours in a specific location.",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {"type": "string", "description": "City or Country"}
                },
                "required": ["location"]
            }
        }
    }
]

# Mapping names to implementations for the engine
TOOLS_MAP = {
    "search_leads": search_leads,
    "research_prospect": research_prospect,
    "check_daylight": check_daylight,
    "perplexica_search": perplexica_search,
}
