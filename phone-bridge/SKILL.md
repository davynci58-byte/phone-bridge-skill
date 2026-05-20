---
name: phone-bridge
description: Control an Android phone (alarms, calendar, notifications) via a lightweight WebSocket relay. Use when you need to set alarms, manage calendar events, send notifications, or check phone health. Covers the phone-invoke.sh CLI and the invoke.js script for all phone bridge commands.
---

# Phone Bridge

Control a paired Android phone through a simple WebSocket relay. No OpenClaw node protocol — just token auth + JSON messages.

## Setup

The relay server runs on the gateway host (port 8765). The phone app connects via `wss://<host>:443/relay/`. The scripts in this skill run against the relay.

**Config:** `RELAY_TOKEN` must match the token set in the phone app Settings → Token field. Default: `5720c3d31ae1cb0063506b6a014f43a242f3ec436a5fa18a`

## Quick Reference

### Check if phone is connected

```
./phone-invoke.sh phone.ping
```

Returns `{"deviceId":"flutter-phone","timestamp":"...","platform":"android","alarms":0,"events":0}`

If the phone isn't connected, you get: `{"ok":false,"error":"phone not connected"}`

### Set alarm

```
./phone-invoke.sh alarm.set '{"hour":7,"minute":0,"label":"Wake up","repeatDays":[false,true,true,true,true,true,false],"snoozeMinutes":5}'
```

Parameters:
| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `hour` | int | 7 | Hour (0-23) |
| `minute` | int | 0 | Minute (0-59) |
| `label` | string | "Alarm" | Display label |
| `repeatDays` | bool[7] | all false | Sun..Sat |
| `snoozeMinutes` | int | 5 | Snooze duration |

### List alarms

```
./phone-invoke.sh alarm.list
```

### Clear alarm(s)

```
./phone-invoke.sh alarm.clear '{"id":"<alarm-id>"}'   # specific
./phone-invoke.sh alarm.clear                          # all
```

### Toggle alarm on/off

```
./phone-invoke.sh alarm.toggle '{"id":"<alarm-id>"}'
```

### List calendar events

```
./phone-invoke.sh calendar.list
```

### Add calendar event

```
./phone-invoke.sh calendar.add '{"title":"Meeting","startTime":"2026-05-20T14:00:00","endTime":"2026-05-20T15:00:00","description":"Team sync"}'
```

Parameters: `title`, `startTime`, `endTime` (ISO 8601), optional `description`, `location`, `allDay`, `reminderMinutes`

### Remove calendar event

```
./phone-invoke.sh calendar.remove '{"id":"<event-id>"}'
```

### Get upcoming events

```
./phone-invoke.sh calendar.upcoming '{"hours":24}'
```

### Send notification to phone

```
./phone-invoke.sh notification.send '{"title":"Alert","body":"Something happened!","playSound":true}'
```

## Using the invoke.js script (agent-friendly)

For programmatic use (returns only the data, exits with code on failure):

```
node invoke.js phone.ping
node invoke.js alarm.set '{"hour":7,"minute":0,"label":"Wake up"}'
node invoke.js calendar.list
```

## Architecture

```
Phone (Android) ←─WSS──→ nginx (:443/relay/) ←──→ Relay (:8765) ←──→ Agent scripts
```

- **Relay server**: lightweight Node.js WebSocket relay in the app repo (`relay-server.js`)
- **Phone app**: Flutter app connects to the relay, handles alarm/calendar/notification commands
- **Agent scripts**: `phone-invoke.sh` / `invoke.js` send commands through the relay
