"""
Vexis Agency — Chatwoot Integration

Connects to Chatwoot for multi-channel messaging (WhatsApp, Email, Live Chat).
This is Nova's primary communication tool for prospect outreach and follow-ups.

Architecture:
    Chatwoot runs as a Docker container (port 3000).
    We use its REST API to:
    1. Send messages to prospects (WhatsApp, Email)
    2. Receive incoming messages via webhooks → forward to Nova
    3. Track conversation status (open, resolved, pending)
    4. Manage contacts (create, update, tag)

Usage:
    chatwoot = ChatwootClient(base_url="http://localhost:3000", api_key="...")
    
    # Send a message
    await chatwoot.send_message(contact_id=123, message="Hi! I noticed...")
    
    # Create a new contact from a lead
    contact = await chatwoot.create_contact(name="John", email="john@example.com")
"""

import logging
from typing import Optional
from datetime import datetime

import httpx

logger = logging.getLogger("vexis.comms.chatwoot")


class ChatwootClient:
    """
    Chatwoot API client for multi-channel messaging.
    
    Supports: WhatsApp, Email, Live Chat, SMS, Telegram
    """

    def __init__(
        self,
        base_url: str = "http://localhost:3000",
        api_key: str = "",
        account_id: int = 1,
    ):
        self._base_url = base_url.rstrip("/")
        self._api_key = api_key
        self._account_id = account_id
        self._headers = {
            "Content-Type": "application/json",
            "api_access_token": api_key,
        }

    @property
    def _api_base(self) -> str:
        return f"{self._base_url}/api/v1/accounts/{self._account_id}"

    # -----------------------------------------------------------------------
    # Contacts
    # -----------------------------------------------------------------------
    async def create_contact(
        self,
        name: str,
        email: str = "",
        phone: str = "",
        company: str = "",
        custom_attributes: dict = None,
    ) -> dict:
        """
        Create a new contact in Chatwoot.
        
        Args:
            name: Contact full name
            email: Email address
            phone: Phone number (E.164 format for WhatsApp)
            company: Company name
            custom_attributes: Extra fields (lead_score, gaps, etc.)
        """
        payload = {
            "name": name,
            "email": email,
            "phone_number": phone,
            "company": {"name": company} if company else None,
            "custom_attributes": custom_attributes or {},
        }

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(
                    f"{self._api_base}/contacts",
                    json=payload,
                    headers=self._headers,
                )

                if response.status_code in (200, 201):
                    data = response.json()
                    logger.info(f"Contact created: {name} (ID: {data.get('id')})")
                    return data
                else:
                    logger.error(f"Failed to create contact: {response.status_code} — {response.text}")
                    return {"error": response.text, "status": response.status_code}

        except Exception as e:
            logger.error(f"Chatwoot contact creation failed: {e}")
            return {"error": str(e)}

    async def get_contact(self, contact_id: int) -> dict:
        """Get a contact by ID."""
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(
                    f"{self._api_base}/contacts/{contact_id}",
                    headers=self._headers,
                )
                return response.json() if response.status_code == 200 else {}
        except Exception as e:
            logger.error(f"Failed to get contact {contact_id}: {e}")
            return {}

    async def search_contacts(self, query: str) -> list[dict]:
        """Search contacts by name, email, or phone."""
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(
                    f"{self._api_base}/contacts/search",
                    params={"q": query},
                    headers=self._headers,
                )
                if response.status_code == 200:
                    return response.json().get("payload", [])
                return []
        except Exception as e:
            logger.error(f"Contact search failed: {e}")
            return []

    # -----------------------------------------------------------------------
    # Conversations
    # -----------------------------------------------------------------------
    async def create_conversation(
        self,
        contact_id: int,
        inbox_id: int,
        message: str = "",
        status: str = "open",
    ) -> dict:
        """
        Create a new conversation with a contact.
        
        Args:
            contact_id: Chatwoot contact ID
            inbox_id: Inbox to use (WhatsApp, Email, etc.)
            message: Initial message
            status: Conversation status (open, pending, resolved)
        """
        payload = {
            "contact_id": contact_id,
            "inbox_id": inbox_id,
            "status": status,
            "message": {"content": message} if message else None,
        }

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(
                    f"{self._api_base}/conversations",
                    json=payload,
                    headers=self._headers,
                )

                if response.status_code in (200, 201):
                    data = response.json()
                    logger.info(f"Conversation created for contact {contact_id}")
                    return data
                else:
                    logger.error(f"Conversation creation failed: {response.text}")
                    return {"error": response.text}

        except Exception as e:
            logger.error(f"Failed to create conversation: {e}")
            return {"error": str(e)}

    async def send_message(
        self,
        conversation_id: int,
        message: str,
        message_type: str = "outgoing",
        private: bool = False,
    ) -> dict:
        """
        Send a message in a conversation.
        
        Args:
            conversation_id: Chatwoot conversation ID
            message: Message content (supports markdown)
            message_type: "outgoing" (to prospect) or "incoming" (from prospect)
            private: If True, message is internal-only (not sent to prospect)
        """
        payload = {
            "content": message,
            "message_type": message_type,
            "private": private,
        }

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(
                    f"{self._api_base}/conversations/{conversation_id}/messages",
                    json=payload,
                    headers=self._headers,
                )

                if response.status_code in (200, 201):
                    logger.info(f"Message sent in conversation {conversation_id}")
                    return response.json()
                else:
                    logger.error(f"Message send failed: {response.text}")
                    return {"error": response.text}

        except Exception as e:
            logger.error(f"Failed to send message: {e}")
            return {"error": str(e)}

    async def get_conversations(
        self,
        status: str = "open",
        page: int = 1,
    ) -> list[dict]:
        """Get conversations filtered by status."""
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(
                    f"{self._api_base}/conversations",
                    params={"status": status, "page": page},
                    headers=self._headers,
                )
                if response.status_code == 200:
                    return response.json().get("data", {}).get("payload", [])
                return []
        except Exception as e:
            logger.error(f"Failed to get conversations: {e}")
            return []

    # -----------------------------------------------------------------------
    # Inboxes (WhatsApp, Email channels)
    # -----------------------------------------------------------------------
    async def list_inboxes(self) -> list[dict]:
        """List all configured inboxes (WhatsApp, Email, etc.)."""
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(
                    f"{self._api_base}/inboxes",
                    headers=self._headers,
                )
                if response.status_code == 200:
                    return response.json().get("payload", [])
                return []
        except Exception as e:
            logger.error(f"Failed to list inboxes: {e}")
            return []

    # -----------------------------------------------------------------------
    # Labels & Tags
    # -----------------------------------------------------------------------
    async def add_label(self, conversation_id: int, label: str) -> bool:
        """Add a label to a conversation (e.g., 'hot_lead', 'follow_up')."""
        try:
            # Get current labels
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(
                    f"{self._api_base}/conversations/{conversation_id}/labels",
                    headers=self._headers,
                )
                current = response.json().get("payload", []) if response.status_code == 200 else []

                # Add new label
                labels = list(set(current + [label]))
                response = await client.post(
                    f"{self._api_base}/conversations/{conversation_id}/labels",
                    json={"labels": labels},
                    headers=self._headers,
                )
                return response.status_code in (200, 201)

        except Exception as e:
            logger.error(f"Failed to add label: {e}")
            return False

    # -----------------------------------------------------------------------
    # Webhook Processing
    # -----------------------------------------------------------------------
    def parse_webhook(self, payload: dict) -> dict:
        """
        Parse an incoming Chatwoot webhook payload.
        
        Returns structured event data for the agent system.
        """
        event = payload.get("event", "")

        parsed = {
            "event": event,
            "timestamp": datetime.utcnow().isoformat(),
            "raw": payload,
        }

        if event == "message_created":
            message = payload.get("content_attributes", {})
            parsed.update({
                "message": payload.get("content", ""),
                "sender_type": payload.get("message_type", ""),
                "conversation_id": payload.get("conversation", {}).get("id"),
                "contact_name": payload.get("sender", {}).get("name", "Unknown"),
                "channel": payload.get("inbox", {}).get("channel_type", ""),
            })

        elif event == "conversation_status_changed":
            parsed.update({
                "conversation_id": payload.get("id"),
                "old_status": payload.get("previous_changes", {}).get("status", [None])[0],
                "new_status": payload.get("status"),
            })

        elif event == "conversation_created":
            parsed.update({
                "conversation_id": payload.get("id"),
                "contact_name": payload.get("meta", {}).get("sender", {}).get("name", ""),
                "channel": payload.get("channel", ""),
            })

        return parsed

    # -----------------------------------------------------------------------
    # Health Check
    # -----------------------------------------------------------------------
    async def health(self) -> dict:
        """Check if Chatwoot is reachable."""
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(f"{self._base_url}/auth/sign_in")
                return {
                    "status": "online" if response.status_code < 500 else "error",
                    "url": self._base_url,
                }
        except Exception:
            return {"status": "offline", "url": self._base_url}
