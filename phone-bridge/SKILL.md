---
name: phone-bridge
description: Framework-agnostic skill for controlling Android phone alarms, calendar, and notifications through a lightweight WebSocket relay. Works with OpenClaw, Hermes, Claude, and any agent that can execute commands or make HTTP/WebSocket calls. Use when you need to set alarms, manage calendar events, send notifications, check phone health, or control a paired Android device.
---

# Phone Bridge — Framework Agnostic

Control a paired Android phone through a simple relay. No OpenClaw node protocol — just token auth + JSON messages. Works with ANY agent framework (OpenClaw, Hermes, Claude Codex, LangChain, AutoGPT, etc.).

## How It Works

```
Phone App ←──WSS──→ Relay Server ←──→ Agent (any framework)
```

- **Phone**: Flutter app (Android) → connects to relay via WebSocket with token auth
- **Relay**: Lightweight Node.js server routing JSON messages
- **Agent**: You! Call `invoke.js` CLI → relay forwards command → phone executes → response back

## Setup Requirements

1. **Relay server** running on the gateway host (port 8765 by default)
2. **Phone app** installed and connected (Settings → Host/Port/TLS/Path/Token → Reconnect)
3. **Auth token** matching between relay, phone app, and agent scripts

## Using the Skill

### Method 1: invoke.js script (recommended for all agents)

```bash
# Check connection
node invoke.js phone.ping

# Set alarm
node invoke.js alarm.set '{"hour":7,"minute":0,"label":"Wake up","repeatDays":[false,true,true,true,true,true,false]}'

# Send notification
node invoke.js notification.send '{"title":"Alert","body":"Something happened!"}'

# List calendar events  
node invoke.js calendar.list

# Add calendar event
node invoke.js calendar.add '{"title":"Meeting","startTime":"2026-05-20T14:00:00","endTime":"2026-05-20T15:00:00"}'
```

**Output format:** Returns JSON, exits 0 on success, 1 on failure.

### Method 2: Shell wrapper (if invoke.js path is inconvenient)

```bash
./phone-invoke.sh phone.ping
```

### Method 3: Direct WebSocket (for agents with WS capability)

Connect to `ws://<host>:8765` (or `wss://<host>:443/relay/` for external).

Auth handshake:
1. Receive `{"type":"auth.challenge","nonce":"..."}`
2. Send `{"type":"auth","token":"<TOKEN>","role":"agent","name":"<YourName>"}`
3. Receive `{"type":"auth.ok","clientId":"...","serverTime":...}`
4. Send invoke: `{"type":"invoke","requestId":"id-1","command":"phone.ping","args":{}}`
5. Receive result: `{"type":"invoke.result","requestId":"id-1","ok":true,"data":{...}}`

## Available Commands

### Phone

| Command | Args | Returns |
|---------|------|---------|
| `phone.ping` | `{}` | Device status, alarm count, event count |

### Alarms

| Command | Args | Returns |
|---------|------|---------|
| `alarm.set` | `{hour, minute, label?, repeatDays?, snoozeMinutes?}` | Alarm ID, time |
| `alarm.list` | `{}` | List of alarms |
| `alarm.clear` | `{id?}` | Cleared count (all if no id) |
| `alarm.toggle` | `{id}` | Success |

### Calendar

| Command | Args | Returns |
|---------|------|---------|
| `calendar.list` | `{}` | All events |
| `calendar.add` | `{title, startTime, endTime, description?, location?, allDay?, reminderMinutes?}` | Event ID |
| `calendar.remove` | `{id}` | Success |
| `calendar.upcoming` | `{hours?}` | Events within N hours |

### Notifications

| Command | Args | Returns |
|---------|------|---------|
| `notification.send` | `{title, body, payload?, playSound?}` | Success |

## Framework-Specific Guidance

### OpenClaw agents
Use `exec` tool to call `scripts/invoke.js`. Path resolves from the skill directory.

```
exec command=node invoke.js phone.ping
exec command="node invoke.js alarm.set '{\"hour\":7,\"minute\":0}'"
```

### Hermes / Claude Codex
Use the `bash` or `execute_command` tool. Same invoke.js script works.

### LangChain / AutoGPT
Use Python subprocess to call `node invoke.js`, or implement the WebSocket protocol directly in Python (see `references/direct-python.md`).

### Any custom agent
Call a shell command, or connect to the relay via WebSocket. The protocol is documented above.

## Scripts

| Script | Purpose |
|--------|---------|
| `scripts/invoke.js` | Main CLI — returns JSON, exit codes. All agents use this. |
| `scripts/phone-invoke.sh` | Shell wrapper (sets env vars). |

Both scripts read `RELAY_URL` and `RELAY_TOKEN` from environment, with sensible defaults.
