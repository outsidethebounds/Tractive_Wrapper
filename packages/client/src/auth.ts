import { HttpClient } from './http.js';
import type { TractiveSession } from './types.js';

export class AuthApi {
  constructor(private readonly http: HttpClient) {}

  async login(email: string, password: string, locale?: string): Promise<TractiveSession> {
    const session = await this.http.request<TractiveSession>('/3/auth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        platform_email: email,
        platform_token: password,
        grant_type: 'tractive',
        ...(locale ? { locale } : {}),
      }),
    });
    this.http.setSession(session);
    return session;
  }

  async verify(): Promise<TractiveSession> {
    return this.http.request<TractiveSession>('/3/auth/verify');
  }

  getSession(): TractiveSession | undefined {
    return this.http.getSession();
  }

  setSession(session?: TractiveSession): void {
    this.http.setSession(session);
  }
}
