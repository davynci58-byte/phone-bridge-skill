#!/bin/bash
# Send a command to the phone via the relay server
# Usage: ./phone-invoke.sh <command> [jsonArgs]
# Commands: phone.ping, alarm.set, alarm.list, alarm.clear, alarm.toggle,
#           calendar.list, calendar.add, calendar.remove, calendar.upcoming,
#           notification.send
NODE_PATH="/home/agentuser/.npm-global/lib/node_modules/openclaw/node_modules" \
RELAY_TOKEN="5720c3d31ae1cb0063506b6a014f43a242f3ec436a5fa18a" \
node /home/agentuser/.openclaw/workspace/phone-bridge.js "$@"
