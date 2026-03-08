import logging
from groq import AsyncGroq

logger = logging.getLogger("vexis.summarizer")

async def summarize_context(messages: list[dict], api_key: str, model: str = "llama-3.1-8b-instant") -> str:
    """
    Condenses a list of chat/tool messages into a dense markdown summary.
    Uses a fast Llama 3 model to avoid TPM limits on the primary model.
    """
    if not messages:
        return ""
        
    try:
        client = AsyncGroq(api_key=api_key)
        
        # Format messages into a script
        script = ""
        for msg in messages:
            if isinstance(msg, dict):
                role = str(msg.get("role", "unknown")).upper()
                content = str(msg.get("content", ""))
                name = msg.get("name", "unknown")
            else:
                role = str(getattr(msg, "role", "unknown")).upper()
                content = str(getattr(msg, "content", ""))
                name = getattr(msg, "name", "unknown")
            
            if role == "TOOL":
                script += f"TOOL ({name}): {content[:1000]}...\n"
            else:
                script += f"{role}: {content[:1000]}...\n"
                
        prompt = (
            "You are a hyper-efficient memory compression module. "
            "Summarize the following interaction into a dense, bulleted Markdown context. "
            "Keep critical facts (names, locations, findings), but discard fluff and intermediate steps. "
            "Output ONLY the markdown summary.\n\n"
            f"<interaction_history>\n{script}\n</interaction_history>"
        )
        
        response = await client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
            max_tokens=600
        )
        
        summary = response.choices[0].message.content
        logger.info(f"Summarized {len(messages)} messages into dense context.")
        return summary
    except Exception as e:
        logger.warning(f"Context summarization failed: {e}")
        return ""
