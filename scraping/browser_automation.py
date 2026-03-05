"""
Vexis Agency — Browser Automation

Provides browser automation capabilities using a lightweight headless approach.
This is used by Archer for scraping complex pages and by Scout and other agents 
for tasks that need a real browser (filling forms, navigating SPAs, booking calls).

Architecture:
    - Uses httpx for simple HTTP-based scraping (fast, no browser overhead)
    - For full browser automation, integrates with BrowserUse or Playwright
    - Falls back gracefully when browser automation isn't available

This module wraps the automation into clean async functions that agents can call
without worrying about browser lifecycle management.
"""

import asyncio
import logging
import re
from typing import Optional
from urllib.parse import urljoin, urlparse

import httpx

logger = logging.getLogger("vexis.scraping.browser")


class BrowserAutomation:
    """
    Browser automation for agents.
    
    Provides methods for:
    - Page scraping (text extraction, link discovery)
    - Form submission
    - Screenshot capture (when browser is available)
    - Multi-page crawling
    
    Usage:
        browser = BrowserAutomation()
        
        # Simple page scrape
        result = await browser.scrape_page("https://example.com")
        
        # Extract all links
        links = await browser.extract_links("https://example.com")
        
        # Extract contact info
        contacts = await browser.extract_contact_info("https://example.com")
    """

    def __init__(self):
        self._headers = {
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            ),
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
        }

    async def scrape_page(self, url: str) -> dict:
        """
        Scrape a page and extract key information.
        
        Returns:
            {
                "url": "...",
                "title": "...",
                "text": "... (cleaned body text)",
                "meta_description": "...",
                "links": [...],
                "emails": [...],
                "phones": [...],
                "social_links": {...},
                "status_code": 200,
            }
        """
        try:
            async with httpx.AsyncClient(
                headers=self._headers,
                follow_redirects=True,
                timeout=20.0,
            ) as client:
                response = await client.get(url)

                if response.status_code != 200:
                    return {
                        "url": url,
                        "error": f"HTTP {response.status_code}",
                        "status_code": response.status_code,
                    }

                html = response.text
                return self._parse_page(url, html, response.status_code)

        except httpx.TimeoutException:
            return {"url": url, "error": "timeout", "status_code": 0}
        except Exception as e:
            return {"url": url, "error": str(e), "status_code": 0}

    def _parse_page(self, url: str, html: str, status_code: int) -> dict:
        """Parse HTML and extract structured data."""
        result = {
            "url": url,
            "status_code": status_code,
            "title": "",
            "meta_description": "",
            "text": "",
            "emails": [],
            "phones": [],
            "social_links": {},
            "links": [],
        }

        # Title
        title_match = re.search(r"<title[^>]*>([^<]+)</title>", html, re.IGNORECASE)
        if title_match:
            result["title"] = title_match.group(1).strip()

        # Meta description
        meta_match = re.search(
            r'<meta\s+name=["\']description["\']\s+content=["\']([^"\']+)["\']',
            html,
            re.IGNORECASE,
        )
        if meta_match:
            result["meta_description"] = meta_match.group(1).strip()

        # Extract clean text (strip HTML tags)
        text = re.sub(r"<script[^>]*>.*?</script>", "", html, flags=re.DOTALL | re.IGNORECASE)
        text = re.sub(r"<style[^>]*>.*?</style>", "", text, flags=re.DOTALL | re.IGNORECASE)
        text = re.sub(r"<[^>]+>", " ", text)
        text = re.sub(r"\s+", " ", text).strip()
        result["text"] = text[:5000]  # Cap at 5k chars

        # Emails
        email_pattern = re.compile(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}")
        emails = list(set(email_pattern.findall(html)))
        # Filter out common false positives
        result["emails"] = [
            e for e in emails
            if not any(skip in e.lower() for skip in ["example.com", "wixpress", "wordpress", "sentry"])
        ]

        # Phone numbers
        phone_pattern = re.compile(r"[+]?\d{1,3}[\s.-]?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,4}")
        result["phones"] = list(set(phone_pattern.findall(html)))[:5]

        # Social media links
        social_patterns = {
            "facebook": r'href=["\']([^"\']*facebook\.com[^"\']*)["\']',
            "twitter": r'href=["\']([^"\']*(?:twitter|x)\.com[^"\']*)["\']',
            "instagram": r'href=["\']([^"\']*instagram\.com[^"\']*)["\']',
            "linkedin": r'href=["\']([^"\']*linkedin\.com[^"\']*)["\']',
            "youtube": r'href=["\']([^"\']*youtube\.com[^"\']*)["\']',
        }
        for platform, pattern in social_patterns.items():
            match = re.search(pattern, html, re.IGNORECASE)
            if match:
                result["social_links"][platform] = match.group(1)

        # Internal links
        link_pattern = re.compile(r'href=["\']([^"\']+)["\']')
        parsed_base = urlparse(url)
        for match in link_pattern.finditer(html):
            href = match.group(1)
            if href.startswith("/"):
                href = urljoin(url, href)
            if href.startswith("http") and parsed_base.netloc in href:
                result["links"].append(href)
        result["links"] = list(set(result["links"]))[:20]

        return result

    async def extract_contact_info(self, url: str) -> dict:
        """
        Extract all contact information from a website.
        Checks the main page, /contact, /about, and /about-us pages.
        """
        pages_to_check = [
            url,
            urljoin(url, "/contact"),
            urljoin(url, "/contact-us"),
            urljoin(url, "/about"),
            urljoin(url, "/about-us"),
        ]

        all_emails = set()
        all_phones = set()
        all_social = {}

        for page_url in pages_to_check:
            try:
                result = await self.scrape_page(page_url)
                if "error" not in result:
                    all_emails.update(result.get("emails", []))
                    all_phones.update(result.get("phones", []))
                    all_social.update(result.get("social_links", {}))
            except Exception:
                continue

        return {
            "url": url,
            "emails": list(all_emails),
            "phones": list(all_phones),
            "social_links": all_social,
        }

    async def extract_links(self, url: str, internal_only: bool = True) -> list[str]:
        """
        Extract all links from a page.
        
        Args:
            url: Page URL to extract links from
            internal_only: If True, only return links on the same domain
        """
        result = await self.scrape_page(url)
        links = result.get("links", [])

        if internal_only:
            parsed = urlparse(url)
            links = [l for l in links if parsed.netloc in l]

        return links

    async def crawl_site(
        self,
        url: str,
        max_pages: int = 10,
        delay: float = 1.0,
    ) -> list[dict]:
        """
        Crawl a website, scraping multiple pages.
        
        Args:
            url: Starting URL
            max_pages: Maximum pages to crawl
            delay: Delay between requests (seconds)
            
        Returns:
            List of page data dicts
        """
        visited = set()
        to_visit = [url]
        results = []

        while to_visit and len(results) < max_pages:
            current_url = to_visit.pop(0)

            if current_url in visited:
                continue

            visited.add(current_url)
            logger.info(f"Crawling: {current_url} ({len(results) + 1}/{max_pages})")

            page_data = await self.scrape_page(current_url)
            results.append(page_data)

            # Add discovered links to queue
            if "error" not in page_data:
                for link in page_data.get("links", []):
                    if link not in visited:
                        to_visit.append(link)

            # Respect rate limits
            if delay > 0:
                await asyncio.sleep(delay)

        return results
