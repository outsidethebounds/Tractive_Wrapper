import type { ApiErrorShape } from './types.js';

export class TractiveApiError extends Error {
  status?: number;
  code?: number;
  category?: string;
  detail?: string | null;
  path?: string;
  body?: unknown;

  constructor(message: string, init: Partial<TractiveApiError> = {}) {
    super(message);
    this.name = 'TractiveApiError';
    Object.assign(this, init);
  }

  static fromResponse(status: number, path: string, body: unknown): TractiveApiError {
    const shaped = (body ?? {}) as ApiErrorShape;
    return new TractiveApiError(shaped.message || `Tractive API error ${status}`, {
      status,
      code: shaped.code,
      category: shaped.category,
      detail: shaped.detail,
      path,
      body,
    });
  }
}
