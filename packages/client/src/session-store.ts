import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { dirname } from 'node:path';
import type { TractiveSession } from './types.js';

export class FileSessionStore {
  constructor(private readonly path: string) {}

  async load(): Promise<TractiveSession | undefined> {
    try {
      const raw = await readFile(this.path, 'utf8');
      return JSON.parse(raw) as TractiveSession;
    } catch {
      return undefined;
    }
  }

  async save(session: TractiveSession): Promise<void> {
    await mkdir(dirname(this.path), { recursive: true });
    await writeFile(this.path, JSON.stringify(session, null, 2), 'utf8');
  }

  async clear(): Promise<void> {
    try {
      await rm(this.path, { force: true });
    } catch {
      // ignore
    }
  }
}
