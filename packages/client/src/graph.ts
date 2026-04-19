import { HttpClient } from './http.js';
import type { ObjectSelector } from './types.js';

export class GraphApi {
  constructor(private readonly http: HttpClient) {}

  get<T>(type: string, id: string): Promise<T> {
    return this.http.request<T>(`/3/${type}/${id}`);
  }

  getRelation<T>(type: string, id: string, relation: string): Promise<T> {
    return this.http.request<T>(`/3/${type}/${id}/${relation}`);
  }

  update<T>(type: string, id: string, version: string | number, payload: unknown): Promise<T> {
    return this.http.request<T>(`/3/${type}/${id}?_version=${encodeURIComponent(String(version))}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  }

  bulk<T = unknown>(selectors: ObjectSelector[]): Promise<T[]> {
    return this.http.request<T[]>('/3/bulk?partial=1', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(selectors),
    });
  }
}
