# Hugging Face Spaces Deployment (Free 24/7 Hosting)

This directory contains the production-ready blueprints to deploy the **Vexis Agency NullClaw Stack** 
to a free Hugging Face Docker Space.

## How it works:
1. **Port 7860**: Hugging Face Spaces only expose port `7860` to the outside world. The lightweight PM2 `ecosystem.config.js` sets up our Python API Gateway to listen specifically on `7860`.
2. **NullClaw Internal Ports**: PM2 concurrently boots the 6 NullClaw native agents on internal ports `3010-3015` inside the container. The Gateway routes traffic cleanly to them. 
3. **Anti-Sleep Bot**: The `keep_alive.py` script automatically pings the container every 25 minutes from the inside so that Hugging Face never spins it down to zero due to inactivity.

## 🚀 3-Click Deployment

1. Go to [Hugging Face Spaces](https://huggingface.co/spaces) and click **Create new Space**.
2. Select **Docker** as the Space SDK and choose **Blank**.
3. Copy all files from this `huggingface/` folder to the root of your new Space repository. (The custom `Dockerfile` handles everything automatically).

Make sure to set your **Secrets** in the Spaces Settings:
- `GROQ_API_KEY_1`, `GROQ_API_KEY_2`, etc.
- `AGENT_EMAIL`
- `AGENT_EMAIL_PASSWORD`
- `NEXT_PUBLIC_CALCOM_API_KEY`
- `NEXT_PUBLIC_DOCUMENSO_API_KEY`
