#!/usr/bin/env node
// Agent-friendly phone command invoker
// Returns parsed JSON response or exits with error
// Usage: node invoke.js <command> [argsJSON]
const RELAY_URL = process.env.RELAY_URL || 'ws://127.0.0.1:8765';
const AUTH_TOKEN = process.env.RELAY_TOKEN || '5720c3d31ae1cb0063506b6a014f43a242f3ec436a5fa18a';

async function main() {
  const cmd = process.argv[2];
  const args = process.argv[3] ? JSON.parse(process.argv[3]) : {};
  const reqId = `agent-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
  const WebSocket = require('ws');
  const ws = new WebSocket(RELAY_URL);
  const t = setTimeout(() => { console.error('{}'); process.exit(1); }, 10000);

  ws.on('message', raw => {
    const m = JSON.parse(raw.toString());
    if (m.type === 'auth.challenge')
      ws.send(JSON.stringify({type:'auth',token:AUTH_TOKEN,role:'agent',name:'Artoria'}));
    if (m.type === 'auth.ok')
      ws.send(JSON.stringify({type:'invoke',requestId:reqId,command:cmd,args}));
    if (m.type === 'invoke.result' && m.requestId === reqId) {
      clearTimeout(t);
      console.log(JSON.stringify(m.data || {ok:m.ok}));
      if (!m.ok) process.exit(1);
      ws.close(); process.exit(0);
    }
  });
  ws.on('error', () => { process.exit(1); });
}
main();
