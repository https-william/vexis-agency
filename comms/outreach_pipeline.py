"""
Vexis Agency — Outreach Pipeline

The bridge between lead generation and communication.
Chains: Scored leads → Contact creation → Email drafting → Campaign enrollment

This is the flow when Archer forwards high-score leads to Nova:
    1. Take scored leads from the lead pipeline
    2. Create contacts in Chatwoot + Mautic
    3. Have Echo draft personalized outreach emails
    4. Enqueue into Mautic drip campaign or send via Chatwoot
    5. Track outreach status and follow-ups

Usage:
    pipeline = OutreachPipeline(chatwoot, mautic, agent_memory)
    results = await pipeline.run(leads, campaign_id=1)
"""

import asyncio
import logging
from datetime import datetime
from dataclasses import dataclass, field, asdict
from typing import Optional

from comms.chatwoot import ChatwootClient
from comms.mautic import MauticClient

logger = logging.getLogger("vexis.comms.outreach")


@dataclass
class OutreachResult:
    """Result of an outreach batch."""
    total_leads: int = 0
    contacts_created: int = 0
    messages_sent: int = 0
    campaigns_enrolled: int = 0
    errors: list[str] = field(default_factory=list)
    details: list[dict] = field(default_factory=list)
    timestamp: str = ""

    def to_dict(self) -> dict:
        return asdict(self)

    def summary(self) -> str:
        """Human-readable summary for Nova to report."""
        lines = [
            f"📤 **Outreach Batch Complete**",
            f"",
            f"- **{self.total_leads}** leads processed",
            f"- **{self.contacts_created}** contacts created in CRM",
            f"- **{self.messages_sent}** initial messages sent",
            f"- **{self.campaigns_enrolled}** enrolled in drip campaign",
        ]

        if self.errors:
            lines.append(f"- ⚠️ **{len(self.errors)}** errors encountered")
            for err in self.errors[:3]:
                lines.append(f"  - {err}")

        lines.append(f"\n*Outreach started at {self.timestamp}*")
        return "\n".join(lines)


class OutreachPipeline:
    """
    End-to-end outreach pipeline.
    
    Takes scored leads and handles the full outreach flow:
    contact creation → message drafting → sending → campaign enrollment.
    """

    def __init__(
        self,
        chatwoot: ChatwootClient,
        mautic: MauticClient,
    ):
        self._chatwoot = chatwoot
        self._mautic = mautic

    async def run(
        self,
        leads: list[dict],
        inbox_id: int = 1,
        campaign_id: Optional[int] = None,
        drip_segment_id: Optional[int] = None,
        send_initial_message: bool = True,
    ) -> OutreachResult:
        """
        Process a batch of leads through the outreach pipeline.
        
        Args:
            leads: List of lead dicts from LeadPipeline.export_for_nova()
            inbox_id: Chatwoot inbox ID (WhatsApp or Email channel)
            campaign_id: Mautic campaign ID for drip enrollment
            drip_segment_id: Mautic segment ID for grouping
            send_initial_message: Whether to send an initial outreach message
            
        Returns:
            OutreachResult with statistics and details
        """
        result = OutreachResult(
            total_leads=len(leads),
            timestamp=datetime.utcnow().isoformat(),
        )

        for lead in leads:
            try:
                detail = await self._process_lead(
                    lead, inbox_id, campaign_id, drip_segment_id, send_initial_message
                )
                result.details.append(detail)

                if detail.get("chatwoot_contact_id"):
                    result.contacts_created += 1
                if detail.get("message_sent"):
                    result.messages_sent += 1
                if detail.get("campaign_enrolled"):
                    result.campaigns_enrolled += 1

            except Exception as e:
                error_msg = f"Failed to process lead '{lead.get('name', 'Unknown')}': {str(e)}"
                result.errors.append(error_msg)
                logger.error(error_msg)

        logger.info(
            f"Outreach batch complete: {result.contacts_created}/{result.total_leads} contacts, "
            f"{result.messages_sent} messages, {result.campaigns_enrolled} campaigns"
        )

        return result

    async def _process_lead(
        self,
        lead: dict,
        inbox_id: int,
        campaign_id: Optional[int],
        drip_segment_id: Optional[int],
        send_initial_message: bool,
    ) -> dict:
        """Process a single lead through the outreach pipeline."""
        detail = {
            "lead_name": lead.get("name", "Unknown"),
            "lead_score": lead.get("score", 0),
            "pitch_angle": lead.get("pitch_angle", ""),
        }

        name = lead.get("name", "Unknown")
        contact_info = lead.get("contact", "")
        email = contact_info if "@" in str(contact_info) else ""
        phone = contact_info if contact_info and "@" not in str(contact_info) else ""

        # Step 1: Create contact in Chatwoot
        chatwoot_contact = await self._chatwoot.create_contact(
            name=name,
            email=email,
            phone=phone,
            company=name,  # Use business name as company
            custom_attributes={
                "lead_score": lead.get("score", 0),
                "gaps": lead.get("gaps", []),
                "pitch_angle": lead.get("pitch_angle", ""),
                "source": "vexis_archer",
            },
        )

        chatwoot_id = chatwoot_contact.get("id")
        detail["chatwoot_contact_id"] = chatwoot_id

        # Step 2: Create contact in Mautic (for email campaigns)
        if email:
            name_parts = name.split(" ", 1)
            mautic_contact = await self._mautic.create_contact(
                email=email,
                first_name=name_parts[0],
                last_name=name_parts[1] if len(name_parts) > 1 else "",
                company=name,
                phone=phone,
                tags=[
                    f"score_{int(lead.get('score', 0))}",
                    f"priority_{lead.get('priority', 'medium')}",
                ] + lead.get("gaps", []),
            )
            detail["mautic_contact_id"] = mautic_contact.get("id")

            # Step 3: Add to drip segment
            if drip_segment_id and detail.get("mautic_contact_id"):
                await self._mautic.add_to_segment(
                    detail["mautic_contact_id"], drip_segment_id
                )

            # Step 4: Enroll in campaign
            if campaign_id and detail.get("mautic_contact_id"):
                enrolled = await self._mautic.add_to_campaign(
                    detail["mautic_contact_id"], campaign_id
                )
                detail["campaign_enrolled"] = enrolled

        # Step 5: Send initial message via Chatwoot
        if send_initial_message and chatwoot_id:
            # Create conversation
            convo = await self._chatwoot.create_conversation(
                contact_id=chatwoot_id,
                inbox_id=inbox_id,
                message=self._generate_initial_message(lead),
            )
            detail["conversation_id"] = convo.get("id")
            detail["message_sent"] = bool(convo.get("id"))

            # Label the conversation
            if convo.get("id"):
                await self._chatwoot.add_label(
                    convo["id"],
                    f"score_{int(lead.get('score', 0))}"
                )

        return detail

    def _generate_initial_message(self, lead: dict) -> str:
        """
        Generate a simple initial outreach message.
        
        For production, this would call Echo to draft a personalized email.
        For now, we use a template based on the pitch angle.
        """
        name = lead.get("name", "there")
        pitch = lead.get("pitch_angle", "improving your online presence")
        gaps = lead.get("gaps", [])

        # Choose template based on primary gap
        if "no_website" in gaps:
            return (
                f"Hi {name},\n\n"
                f"I noticed your business doesn't have a website yet. "
                f"In today's digital landscape, that's leaving money on the table. "
                f"We specialize in {pitch} and have helped similar businesses "
                f"increase their leads by 3-5x within the first month.\n\n"
                f"Would you be open to a quick 15-minute call to see if we can help?\n\n"
                f"Best,\nVexis Agency"
            )
        elif "low_rating" in gaps:
            return (
                f"Hi {name},\n\n"
                f"I came across your business and noticed there's an opportunity "
                f"to improve your online reputation. We help businesses like yours "
                f"with {pitch}, turning negative reviews into growth opportunities.\n\n"
                f"I'd love to share a few quick wins that could help. "
                f"Do you have 10 minutes for a call this week?\n\n"
                f"Best,\nVexis Agency"
            )
        else:
            return (
                f"Hi {name},\n\n"
                f"I recently came across your business and saw some exciting "
                f"opportunities for growth. We specialize in {pitch} and have "
                f"helped similar businesses scale their online presence significantly.\n\n"
                f"Would you be interested in a quick chat to explore how we could help?\n\n"
                f"Best,\nVexis Agency"
            )

    async def send_follow_up(
        self,
        conversation_id: int,
        days_since_last: int,
        lead_info: dict,
    ) -> dict:
        """
        Send a follow-up message for stale conversations.
        Called by Nova's proactive cron trigger.
        
        Strategy:
        - Day 3: Gentle nudge with value-add
        - Day 7: Different angle (case study)
        - Day 14: Break-up email (creates urgency)
        """
        name = lead_info.get("name", "there")

        if days_since_last <= 5:
            message = (
                f"Hi {name}, just following up on my previous message. "
                f"I understand you're busy — just wanted to make sure "
                f"my message didn't get lost in the shuffle.\n\n"
                f"Quick question: is improving your online presence "
                f"something you're thinking about right now?\n\n"
                f"Best,\nVexis Agency"
            )
        elif days_since_last <= 10:
            message = (
                f"Hi {name}, I wanted to share a quick case study. "
                f"We recently helped a business similar to yours increase "
                f"their online leads by 400% in just 60 days.\n\n"
                f"If that sounds interesting, I'd love to show you "
                f"how we could do the same for you.\n\n"
                f"Best,\nVexis Agency"
            )
        else:
            message = (
                f"Hi {name}, I'll keep this brief — I've reached out "
                f"a couple of times and I want to respect your time.\n\n"
                f"If you're not interested in growing your online presence "
                f"right now, no worries at all. But if things change, "
                f"feel free to reach out.\n\n"
                f"Wishing you all the best,\nVexis Agency"
            )

        result = await self._chatwoot.send_message(
            conversation_id=conversation_id,
            message=message,
        )

        return {
            "conversation_id": conversation_id,
            "follow_up_type": (
                "gentle_nudge" if days_since_last <= 5
                else "case_study" if days_since_last <= 10
                else "break_up"
            ),
            "sent": bool(result.get("id")),
        }
