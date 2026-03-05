"""
Vexis Agency — Mautic Integration

Connects to Mautic for email marketing automation (drip campaigns, newsletters).
Used by Nova and Echo for automated email sequences.

Architecture:
    Mautic runs as a Docker container (port 8080).
    We use its REST API to:
    1. Create/manage contacts (synced from Chatwoot)
    2. Add contacts to email segments
    3. Trigger drip campaigns
    4. Track email opens/clicks/replies

Usage:
    mautic = MauticClient(base_url="http://localhost:8080", username="...", password="...")
    
    # Add a contact
    contact = await mautic.create_contact(email="john@example.com", first_name="John")
    
    # Add to a campaign
    await mautic.add_to_campaign(contact_id=123, campaign_id=1)
"""

import logging
import base64
from typing import Optional

import httpx

logger = logging.getLogger("vexis.comms.mautic")


class MauticClient:
    """
    Mautic API client for email marketing automation.
    
    Supports: contacts, segments, campaigns, emails, and forms.
    Uses Basic Auth for API access.
    """

    def __init__(
        self,
        base_url: str = "http://localhost:8080",
        username: str = "",
        password: str = "",
    ):
        self._base_url = base_url.rstrip("/")
        self._username = username
        self._password = password
        self._auth_header = base64.b64encode(
            f"{username}:{password}".encode()
        ).decode()
        self._headers = {
            "Content-Type": "application/json",
            "Authorization": f"Basic {self._auth_header}",
        }

    @property
    def _api_base(self) -> str:
        return f"{self._base_url}/api"

    # -----------------------------------------------------------------------
    # Contacts
    # -----------------------------------------------------------------------
    async def create_contact(
        self,
        email: str,
        first_name: str = "",
        last_name: str = "",
        company: str = "",
        phone: str = "",
        tags: list[str] = None,
        custom_fields: dict = None,
    ) -> dict:
        """
        Create or update a contact in Mautic.
        
        Args:
            email: Email address (required, used as unique key)
            first_name: First name
            last_name: Last name
            company: Company name
            phone: Phone number
            tags: Tags to add (e.g., ["hot_lead", "no_website"])
            custom_fields: Custom fields matching Mautic field names
        """
        payload = {
            "email": email,
            "firstname": first_name,
            "lastname": last_name,
            "company": company,
            "phone": phone,
            "tags": tags or [],
        }

        if custom_fields:
            payload.update(custom_fields)

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(
                    f"{self._api_base}/contacts/new",
                    json=payload,
                    headers=self._headers,
                )

                if response.status_code in (200, 201):
                    data = response.json()
                    contact = data.get("contact", {})
                    logger.info(f"Mautic contact created: {email} (ID: {contact.get('id')})")
                    return contact
                else:
                    logger.error(f"Mautic contact creation failed: {response.status_code}")
                    return {"error": response.text}

        except Exception as e:
            logger.error(f"Mautic API error: {e}")
            return {"error": str(e)}

    async def get_contact(self, contact_id: int) -> dict:
        """Get a contact by ID."""
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(
                    f"{self._api_base}/contacts/{contact_id}",
                    headers=self._headers,
                )
                if response.status_code == 200:
                    return response.json().get("contact", {})
                return {}
        except Exception as e:
            logger.error(f"Failed to get Mautic contact: {e}")
            return {}

    async def search_contacts(self, query: str) -> list[dict]:
        """Search contacts by email or name."""
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(
                    f"{self._api_base}/contacts",
                    params={"search": query},
                    headers=self._headers,
                )
                if response.status_code == 200:
                    data = response.json()
                    return list(data.get("contacts", {}).values())
                return []
        except Exception as e:
            logger.error(f"Mautic contact search failed: {e}")
            return []

    # -----------------------------------------------------------------------
    # Segments
    # -----------------------------------------------------------------------
    async def add_to_segment(self, contact_id: int, segment_id: int) -> bool:
        """Add a contact to a segment."""
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(
                    f"{self._api_base}/segments/{segment_id}/contact/{contact_id}/add",
                    headers=self._headers,
                )
                success = response.status_code in (200, 201)
                if success:
                    logger.info(f"Contact {contact_id} added to segment {segment_id}")
                return success
        except Exception as e:
            logger.error(f"Failed to add to segment: {e}")
            return False

    async def list_segments(self) -> list[dict]:
        """List all segments."""
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(
                    f"{self._api_base}/segments",
                    headers=self._headers,
                )
                if response.status_code == 200:
                    data = response.json()
                    return list(data.get("lists", {}).values())
                return []
        except Exception as e:
            logger.error(f"Failed to list segments: {e}")
            return []

    # -----------------------------------------------------------------------
    # Campaigns
    # -----------------------------------------------------------------------
    async def add_to_campaign(self, contact_id: int, campaign_id: int) -> bool:
        """Add a contact to a campaign (starts the drip sequence)."""
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(
                    f"{self._api_base}/campaigns/{campaign_id}/contact/{contact_id}/add",
                    headers=self._headers,
                )
                success = response.status_code in (200, 201)
                if success:
                    logger.info(f"Contact {contact_id} added to campaign {campaign_id}")
                return success
        except Exception as e:
            logger.error(f"Failed to add to campaign: {e}")
            return False

    async def list_campaigns(self) -> list[dict]:
        """List all campaigns."""
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(
                    f"{self._api_base}/campaigns",
                    headers=self._headers,
                )
                if response.status_code == 200:
                    data = response.json()
                    return list(data.get("campaigns", {}).values())
                return []
        except Exception as e:
            logger.error(f"Failed to list campaigns: {e}")
            return []

    async def get_campaign_stats(self, campaign_id: int) -> dict:
        """Get statistics for a campaign."""
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(
                    f"{self._api_base}/campaigns/{campaign_id}",
                    headers=self._headers,
                )
                if response.status_code == 200:
                    campaign = response.json().get("campaign", {})
                    return {
                        "id": campaign.get("id"),
                        "name": campaign.get("name"),
                        "published": campaign.get("isPublished"),
                        "contacts": campaign.get("contactCount", 0),
                    }
                return {}
        except Exception as e:
            logger.error(f"Failed to get campaign stats: {e}")
            return {}

    # -----------------------------------------------------------------------
    # Emails
    # -----------------------------------------------------------------------
    async def send_email(
        self,
        contact_id: int,
        email_id: int,
        custom_tokens: dict = None,
    ) -> bool:
        """
        Send a pre-built email template to a contact.
        
        Args:
            contact_id: Mautic contact ID
            email_id: Mautic email template ID
            custom_tokens: Token replacements (e.g., {contact_name: "John"})
        """
        try:
            payload = {}
            if custom_tokens:
                payload["tokens"] = custom_tokens

            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(
                    f"{self._api_base}/emails/{email_id}/contact/{contact_id}/send",
                    json=payload,
                    headers=self._headers,
                )
                success = response.status_code in (200, 201)
                if success:
                    logger.info(f"Email {email_id} sent to contact {contact_id}")
                return success
        except Exception as e:
            logger.error(f"Failed to send email: {e}")
            return False

    async def create_email(
        self,
        name: str,
        subject: str,
        html_body: str,
        from_name: str = "Vexis Agency",
        from_email: str = "",
    ) -> dict:
        """Create an email template in Mautic."""
        payload = {
            "name": name,
            "subject": subject,
            "customHtml": html_body,
            "emailType": "list",
            "fromName": from_name,
            "fromAddress": from_email,
            "isPublished": True,
        }

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(
                    f"{self._api_base}/emails/new",
                    json=payload,
                    headers=self._headers,
                )
                if response.status_code in (200, 201):
                    return response.json().get("email", {})
                return {"error": response.text}
        except Exception as e:
            logger.error(f"Failed to create email: {e}")
            return {"error": str(e)}

    # -----------------------------------------------------------------------
    # Health Check
    # -----------------------------------------------------------------------
    async def health(self) -> dict:
        """Check if Mautic is reachable."""
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(f"{self._base_url}/s/login")
                return {
                    "status": "online" if response.status_code < 500 else "error",
                    "url": self._base_url,
                }
        except Exception:
            return {"status": "offline", "url": self._base_url}
