FROM debian:bookworm-slim

# NullClaw runs as a static binary — we just need libc and curl for healthcheck
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# The NullClaw binary will be mounted via volume or downloaded at build
# For now, use volume mount: ./nullclaw-bin:/usr/local/bin/nullclaw
WORKDIR /agent

# Config and data directories
RUN mkdir -p /data

# Copy config (overridden by volume mount in docker-compose)
COPY config.json ./config.json

EXPOSE 3000

# Start NullClaw gateway with the agent config
CMD ["nullclaw", "gateway", "--config", "/agent/config.json"]
