FROM debian:bullseye-slim

WORKDIR /app

# Install dependencies: Curl for binaries, NodeJS for PM2 process manager, Python 3 for the orchestration gateway
RUN apt-get update && apt-get install -y \
    curl \
    ca-certificates \
    python3 \
    python3-pip \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*

# Install PM2 Lightweight Process Manager
RUN npm install -g pm2

# Setup Python dependencies for the orchestration gateway & keep_alive
COPY gateway/requirements.txt ./gateway_requirements.txt
RUN pip3 install --no-cache-dir -r gateway_requirements.txt requests

# Copy the entire project context
COPY . /app

# Ensure the executable permissions for NullClaw binaries
RUN chmod +x /app/nullclaw-bin/nullclaw

# Expose the single port HuggingFace Spaces uses
EXPOSE 7860

# Run PM2 in no-daemon mode so the HuggingFace Docker container stays alive
CMD ["pm2-runtime", "huggingface/ecosystem.config.js"]
