#!/usr/bin/env node
// Phone Bridge CLI — framework-agnostic
// Works with OpenClaw, Hermes, Claude, LangChain, AutoGPT, any agent.
// Usage: node invoke.js <command> [argsJSON]
//   node invoke.js phone.ping
//   node invoke.js alarm.set '{"hour":7,"minute":0,"label":"Wake up"}'
//   node invoke.js notification.send '{"title":"Hi","body":"Test"}'
//   node invoke.js calendar.list
//
// Env: RELAY_URL (default: ws://127.0.0.1:8765)
// Env: RELAY_TOKEN (default: 5720c3d31ae1cb0063506b6a014f43a242f3ec436a5fa18a)

const RELAY_URL = process.env.RELAY_URL || 'ws://127.0.0.1:8765';
const AUTH_TOKEN = process.env.RELAY_TOKEN || '5720c3d31ae1cb0063506b6a014f43a242f3ec436a5fa18a';

const cmd = process.argv[2];
if (!cmd) {
  console.log(JSON.stringify({ error: 'Usage: invoke.js <command> [argsJSON]' }));
  process.exit(1);
}
const args = process.argv[3] ? JSON.parse(process.argv[3]) : {};
const reqId = `agent-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
const WebSocket = require('ws');
const ws = new WebSocket(RELAY_URL);
const timeout = setTimeout(() => {
  console.log(JSON.stringify({ error: 'timeout' }));
  process.exit(1);
}, 10000);

ws.on('message', raw => {
  const m = JSON.parse(raw.toString());
  if (m.type === 'auth.challenge') {
    ws.send(JSON.stringify({ type: 'auth', token: AUTH_TOKEN, role: 'agent', name: 'Artoria' }));
  }
  if (m.type === 'auth.ok') {
    ws.send(JSON.stringify({ type: 'invoke', requestId: reqId, command: cmd, args }));
  }
  if (m.type === 'invoke.result' && m.requestId === reqId) {
    clearTimeout(timeout);
    const result = m.data || { ok: m.ok, error: m.error };
    console.log(JSON.stringify(result));
    ws.close();
    process.exit(m.ok ? 0 : 1);
  }
});
ws.on('error', () => {
  console.log(JSON.stringify({ error: 'connection_failed' }));
  process.exit(1);
});
