declare module 'node:readline/promises' {
  export function createInterface(options: { input: unknown; output: unknown }): {
    question(prompt: string): Promise<string>;
    close(): void;
  };
}

declare module 'node:process' {
  export const stdin: unknown;
  export const stdout: unknown;
}

declare module 'node:path' {
  export function join(...parts: string[]): string;
}

declare module 'node:fs/promises' {
  export function readFile(path: string): Promise<Uint8Array>;
  export function readFile(path: string, encoding: string): Promise<string>;
}
