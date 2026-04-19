declare const process: {
  env: Record<string, string | undefined>;
  argv: string[];
  cwd(): string;
  exit(code?: number): never;
};

declare const console: {
  log: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
  dir: (obj: unknown, options?: unknown) => void;
};
