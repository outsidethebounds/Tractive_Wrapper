import { TractiveApiError } from './errors.js';
import type { TractiveClientOptions, TractiveSession } from './types.js';

export class HttpClient {
  readonly graphBaseUrl: string;
  readonly channelBaseUrl: string;
  readonly appId: string;
  readonly appBuild?: string;
  readonly appVersion?: string;
  readonly defaultClientId: string;
  session?: TractiveSession;

  constructor(options: TractiveClientOptions = {}) {
    this.graphBaseUrl = options.graphBaseUrl ?? 'https://graph.tractive.com';
    this.channelBaseUrl = options.channelBaseUrl ?? 'https://channel.tractive.com/3';
    this.appId = options.appId ?? 'site.tractivegps';
    this.appBuild = options.appBuild;
    this.appVersion = options.appVersion;
    this.defaultClientId = '5728aa1fc9077f7c32000186';
    this.session = options.session;
  }

  setSession(session?: TractiveSession): void {
    this.session = session;
  }

  getSession(): TractiveSession | undefined {
    return this.session;
  }

  authHeaders(extra: HeadersInit = {}): Headers {
    const headers = new Headers(extra);
    headers.set('Accept', 'application/json');
    headers.set('X-Tractive-App', this.appId);
    if (this.appBuild) headers.set('X-Tractive-AppBuild', this.appBuild);
    if (this.appVersion) headers.set('X-Tractive-AppVersion', this.appVersion);
    if (this.session?.client_id) headers.set('X-Tractive-Client', this.session.client_id);
    if (this.session?.access_token) headers.set('Authorization', `Bearer ${this.session.access_token}`);
    return headers;
  }

  async request<T>(path: string, init: RequestInit = {}, baseUrl = this.graphBaseUrl): Promise<T> {
    const url = `${baseUrl}${path}`;
    const headers = this.authHeaders(init.headers);
    const res = await fetch(url, { ...init, headers });
    const text = await res.text();
    const body = text ? safeJsonParse(text) : null;
    if (!res.ok) throw TractiveApiError.fromResponse(res.status, path, body ?? text);
    return body as T;
  }
}

function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
