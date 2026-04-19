import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { FileSessionStore, TractiveClient } from '@tractive/client';

const ROOT_DIR = process.cwd();
const SESSION_PATH = join(ROOT_DIR, '.tractive-session.json');
const STATIC_DIR = join(ROOT_DIR, 'static');
const PORT = Number(process.env.PORT || 4173);
const HOST = process.env.HOST || '0.0.0.0';

async function buildClient(): Promise<TractiveClient> {
  const client = new TractiveClient();
  const store = new FileSessionStore(SESSION_PATH);

  const imported = await loadImportedSession();
  if (imported) {
    client.auth.setSession(imported);
    const verified = await client.auth.verify();
    client.auth.setSession(verified);
    await store.save(verified);
    return client;
  }

  const saved = await store.load();
  if (saved) {
    client.auth.setSession(saved);
    const verified = await client.auth.verify();
    client.auth.setSession(verified);
    await store.save(verified);
    return client;
  }

  throw new Error('No valid imported/saved session available for UI.');
}

async function loadImportedSession(): Promise<any | undefined> {
  const rawJson = process.env.TRACTIVE_SESSION_JSON;
  if (rawJson) return JSON.parse(rawJson);
  const sessionFile = process.env.TRACTIVE_SESSION_FILE;
  if (sessionFile) return JSON.parse(await readFile(sessionFile, 'utf8'));
  return undefined;
}

const client = await buildClient();

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', `http://${req.headers.host}`);

    if (url.pathname === '/api/summary') {
      const session = client.auth.getSession();
      if (!session) throw new Error('Missing session');
      const [trackers, petRefs] = await Promise.all([
        client.users.getUserTrackers<any[]>(session.user_id),
        client.users.getUserTrackableObjects<any[]>(session.user_id),
      ]);
      const pets = await Promise.all(
        petRefs.map(async (pet) => {
          if (pet?._type === 'pet' && pet?._id) {
            try {
              return await client.pets.getPet<any>(pet._id);
            } catch {
              return pet;
            }
          }
          return pet;
        })
      );
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ userId: session.user_id, trackers, pets }));
      return;
    }

    if (url.pathname.startsWith('/api/tracker/')) {
      const trackerId = url.pathname.split('/').pop();
      if (!trackerId) throw new Error('Missing tracker id');
      const [tracker, positionReport, hardwareReport] = await Promise.all([
        client.trackers.getTracker<any>(trackerId),
        client.trackers.getTrackerPositionReport<any>(trackerId),
        client.trackers.getTrackerHardwareReport<any>(trackerId),
      ]);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ tracker, positionReport, hardwareReport }));
      return;
    }

    if (url.pathname === '/api/control') {
      if (req.method !== 'POST') {
        res.writeHead(405, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Method not allowed' }));
        return;
      }
      const body = await readRequestBody(req);
      const { trackerId, action } = JSON.parse(body || '{}');
      if (!trackerId || !action) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'trackerId and action are required' }));
        return;
      }

      let result: unknown;
      switch (action) {
        case 'request_position':
          result = await client.graph.getRelation('tracker', trackerId, 'command/pos_request/on');
          break;
        case 'live_on':
          result = await client.trackers.setLiveTracking(trackerId, true);
          break;
        case 'live_off':
          result = await client.trackers.setLiveTracking(trackerId, false);
          break;
        case 'light':
          result = await client.trackers.setLed(trackerId, true);
          break;
        case 'sound':
          result = await client.trackers.setBuzzer(trackerId, true);
          break;
        default:
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: `Unknown action: ${action}` }));
          return;
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, action, result }));
      return;
    }

    if (url.pathname === '/api/stream') {
      const trackerId = url.searchParams.get('trackerId');
      if (!trackerId) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'trackerId is required' }));
        return;
      }

      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      });

      const opened = await client.channel.openChannel();
      await client.channel.subscribe(opened.channelId, 'tracker_status');
      res.write(`data: ${JSON.stringify({ type: 'handshake', payload: opened.handshake })}\n\n`);

      req.on('close', () => {
        try { res.end(); } catch {}
      });

      for await (const event of client.channel.iterateEvents(opened.stream)) {
        if ((event as any).message === 'tracker_status' && (event as any).tracker_id === trackerId) {
          res.write(`data: ${JSON.stringify({ type: 'tracker_status', payload: event })}\n\n`);
        }
      }
      return;
    }

    const filePath = url.pathname === '/' ? join(STATIC_DIR, 'index.html') : join(STATIC_DIR, url.pathname);
    const data = await readFile(filePath);
    const contentType = filePath.endsWith('.html') ? 'text/html; charset=utf-8'
      : filePath.endsWith('.js') ? 'text/javascript; charset=utf-8'
      : filePath.endsWith('.css') ? 'text/css; charset=utf-8'
      : 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }));
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Tractive inspector UI listening on http://${HOST}:${PORT}`);
});

async function readRequestBody(req: any): Promise<string> {
  return await new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk: Buffer | string) => {
      body += chunk.toString();
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}
