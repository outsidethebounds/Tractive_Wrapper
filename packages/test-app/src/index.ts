import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { join } from 'node:path';
import { readFile } from 'node:fs/promises';
import { FileSessionStore, TractiveClient } from '@tractive/client';

const SESSION_PATH = join(process.cwd(), 'packages', 'test-app', '.tractive-session.json');
const ENV_PATH_HINT = 'packages/test-app/.env';

async function main(): Promise<void> {
  const args = new Set(process.argv.slice(2));
  const mode = firstNonFlag(process.argv.slice(2)) ?? 'summary';
  const client = new TractiveClient();
  const store = new FileSessionStore(SESSION_PATH);

  if (args.has('--clear-session')) {
    await store.clear();
    console.log('Cleared saved session.');
  }

  const session = await getSession(client, store, args.has('--prompt-login'));
  console.log(`Using session for user ${session.user_id}`);

  const trackers = await client.users.getUserTrackers<any[]>(session.user_id);
  const trackableObjects = await client.users.getUserTrackableObjects<any[]>(session.user_id);

  switch (mode) {
    case 'trackers':
      printTrackers(trackers);
      break;
    case 'pets':
      printPets(trackableObjects);
      break;
    case 'tracker': {
      const trackerId = valueAfterCommand(process.argv.slice(2), 'tracker') ?? trackers[0]?._id;
      if (!trackerId) throw new Error('No tracker id available');
      await showTrackerDetails(client, trackerId);
      break;
    }
    case 'stream': {
      const trackerId = valueAfterCommand(process.argv.slice(2), 'stream') ?? trackers[0]?._id;
      if (!trackerId) throw new Error('No tracker id available');
      await streamTracker(client, trackerId);
      break;
    }
    case 'summary':
    default:
      printTrackers(trackers);
      console.log('');
      printPets(trackableObjects);
      break;
  }
}

async function getSession(client: TractiveClient, store: FileSessionStore, forcePrompt: boolean) {
  if (!forcePrompt) {
    const imported = await loadImportedSession();
    if (imported) {
      client.auth.setSession(imported);
      try {
        const verified = await client.auth.verify();
        client.auth.setSession(verified);
        await store.save(verified);
        console.log('Imported and verified session from file/env.');
        return verified;
      } catch {
        console.log('Imported session was invalid; continuing.');
      }
    }

    const saved = await store.load();
    if (saved) {
      client.auth.setSession(saved);
      try {
        const verified = await client.auth.verify();
        client.auth.setSession(verified);
        await store.save(verified);
        console.log('Reused saved session.');
        return verified;
      } catch {
        console.log('Saved session expired or invalid; falling back to login.');
      }
    }
  }

  const envEmail = process.env.TRACTIVE_EMAIL;
  const envPassword = process.env.TRACTIVE_PASSWORD;
  if (envEmail && envPassword && !forcePrompt) {
    const session = await client.auth.login(envEmail, envPassword);
    await store.save(session);
    console.log('Logged in with credentials from env and saved session.');
    return session;
  }

  const creds = await promptForCredentials();
  const session = await client.auth.login(creds.email, creds.password);
  await store.save(session);
  console.log(`Logged in interactively and saved session. Tip: you can also use ${ENV_PATH_HINT}`);
  return session;
}

async function loadImportedSession(): Promise<any | undefined> {
  const rawJson = process.env.TRACTIVE_SESSION_JSON;
  if (rawJson) {
    return JSON.parse(rawJson);
  }

  const sessionFile = process.env.TRACTIVE_SESSION_FILE;
  if (sessionFile) {
    return JSON.parse(await readFile(sessionFile, 'utf8'));
  }

  return undefined;
}

async function promptForCredentials(): Promise<{ email: string; password: string }> {
  const rl = createInterface({ input, output });
  try {
    const email = (await rl.question('Tractive email: ')).trim();
    const password = (await rl.question('Tractive password: ')).trim();
    if (!email || !password) throw new Error('Both email and password are required');
    return { email, password };
  } finally {
    rl.close();
  }
}

function printTrackers(trackers: any[]): void {
  console.log('Trackers:');
  for (const tracker of trackers) {
    const model = tracker?.details?.model_number ?? 'unknown';
    const state = tracker?.tracker_state ?? 'unknown';
    const battery = tracker?.battery_level ?? tracker?.hardware?.battery_level ?? 'n/a';
    console.log(`- ${tracker._id} | model=${model} | state=${state} | battery=${battery}`);
  }
}

function printPets(trackableObjects: any[]): void {
  console.log('Trackable objects:');
  for (const obj of trackableObjects) {
    const name = obj?.details?.name ?? obj?._id;
    console.log(`- ${name} (${obj._type}:${obj._id})`);
  }
}

async function showTrackerDetails(client: TractiveClient, trackerId: string): Promise<void> {
  const [tracker, pos, hw] = await Promise.all([
    client.trackers.getTracker<any>(trackerId),
    client.trackers.getTrackerPositionReport<any>(trackerId),
    client.trackers.getTrackerHardwareReport<any>(trackerId),
  ]);
  console.log(`Tracker ${trackerId}`);
  console.dir({ tracker, positionReport: pos, hardwareReport: hw }, { depth: 6 });
}

async function streamTracker(client: TractiveClient, trackerId: string): Promise<void> {
  console.log(`Opening realtime stream for tracker ${trackerId}... Ctrl-C to stop.`);
  const opened = await client.channel.openChannel();
  await client.channel.subscribe(opened.channelId, 'tracker_status');
  console.log('Channel handshake:', opened.handshake);
  for await (const event of client.channel.iterateEvents(opened.stream)) {
    if ((event as any).message === 'tracker_status' && (event as any).tracker_id === trackerId) {
      console.dir(event, { depth: 6 });
    }
  }
}

function firstNonFlag(args: string[]): string | undefined {
  return args.find((arg) => !arg.startsWith('--'));
}

function valueAfterCommand(args: string[], command: string): string | undefined {
  const index = args.findIndex((arg) => arg === command);
  if (index === -1) return undefined;
  return args[index + 1];
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
