module.exports = {
    apps: [
        {
            name: "vexis-python-gateway",
            script: "python3",
            args: "-m uvicorn gateway.main:app --host 0.0.0.0 --port 7860", // HF default exposed port
            cwd: "./",
            interpreter: "none",
            env: {
                "NEXT_PUBLIC_USE_NULLCLAW": "true", // Tell gateway to route to the native binaries
                "GATEWAY_PORT": "7860"
            }
        },
        {
            name: "nullclaw-archer",
            script: "./nullclaw-bin/nullclaw",
            args: "--config nullclaw/archer/config.json --port 3010",
            cwd: "./",
            interpreter: "none"
        },
        {
            name: "nullclaw-nova",
            script: "./nullclaw-bin/nullclaw",
            args: "--config nullclaw/nova/config.json --port 3011",
            cwd: "./",
            interpreter: "none"
        },
        {
            name: "nullclaw-scout",
            script: "./nullclaw-bin/nullclaw",
            args: "--config nullclaw/scout/config.json --port 3012",
            cwd: "./",
            interpreter: "none"
        },
        {
            name: "nullclaw-echo",
            script: "./nullclaw-bin/nullclaw",
            args: "--config nullclaw/echo/config.json --port 3013",
            cwd: "./",
            interpreter: "none"
        },
        {
            name: "nullclaw-atlas",
            script: "./nullclaw-bin/nullclaw",
            args: "--config nullclaw/atlas/config.json --port 3014",
            cwd: "./",
            interpreter: "none"
        },
        {
            name: "nullclaw-sentinel",
            script: "./nullclaw-bin/nullclaw",
            args: "--config nullclaw/sentinel/config.json --port 3015",
            cwd: "./",
            interpreter: "none"
        },
        {
            name: "hf-anti-sleep",
            script: "python3",
            args: "huggingface/keep_alive.py",
            cwd: "./",
            interpreter: "none"
        }
    ]
}
