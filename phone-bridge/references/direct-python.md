# Direct Python WebSocket client

For agents that can run Python (LangChain, AutoGPT, custom scripts), use this instead of Node.js.

```python
import json, uuid, os, sys
import websocket  # pip install websocket-client

RELAY_URL = os.environ.get("RELAY_URL", "ws://127.0.0.1:8765")
AUTH_TOKEN = os.environ.get("RELAY_TOKEN", "5720c3d31ae1cb0063506b6a014f43a242f3ec436a5fa18a")

def phone_invoke(command, args=None):
    """Send command to phone and return result."""
    ws = websocket.create_connection(RELAY_URL, timeout=10)
    request_id = f"agent-{uuid.uuid4().hex[:8]}"

    # Wait for auth challenge
    msg = json.loads(ws.recv())
    assert msg["type"] == "auth.challenge"

    # Authenticate
    ws.send(json.dumps({
        "type": "auth", "token": AUTH_TOKEN,
        "role": "agent", "name": "Artoria"
    }))
    msg = json.loads(ws.recv())
    assert msg["type"] == "auth.ok"

    # Send command
    ws.send(json.dumps({
        "type": "invoke", "requestId": request_id,
        "command": command, "args": args or {}
    }))

    # Wait for response
    while True:
        msg = json.loads(ws.recv())
        if msg.get("requestId") == request_id:
            ws.close()
            return msg

    ws.close()

# ── Usage ──────────────────────────────────────────────────────────

# Ping
result = phone_invoke("phone.ping")
print(result["data"])

# Set alarm
result = phone_invoke("alarm.set", {
    "hour": 7, "minute": 0, "label": "Wake up"
})

# Send notification
result = phone_invoke("notification.send", {
    "title": "From Python",
    "body": "Hello from your agent!"
})
```
