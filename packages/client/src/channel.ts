import { HttpClient } from './http.js';
import type { ChannelEvent, ChannelHandshakeEvent } from './types.js';

export class ChannelApi {
  constructor(private readonly http: HttpClient) {}

  async openChannel(): Promise<{ channelId: string; stream: ReadableStream<Uint8Array>; handshake: ChannelHandshakeEvent }> {
    const res = await fetch(`${this.http.channelBaseUrl}/channel`, {
      method: 'POST',
      headers: this.http.authHeaders({ 'Content-Type': 'application/json' }),
      body: '{}',
    });
    if (!res.ok || !res.body) {
      throw new Error(`Failed to open channel: ${res.status}`);
    }
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) throw new Error('Channel closed before handshake');
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        const event = JSON.parse(trimmed) as ChannelEvent;
        if ((event as ChannelHandshakeEvent).message === 'handshake') {
          return {
            channelId: (event as ChannelHandshakeEvent).channel_id,
            handshake: event as ChannelHandshakeEvent,
            stream: new ReadableStream<Uint8Array>({
              start(controller) {
                const firstChunk = new TextEncoder().encode(buffer);
                if (firstChunk.length) controller.enqueue(firstChunk);
                void pump(controller);
                async function pump(ctrl: ReadableStreamDefaultController<Uint8Array>) {
                  try {
                    while (true) {
                      const next = await reader.read();
                      if (next.done) break;
                      ctrl.enqueue(next.value);
                    }
                    ctrl.close();
                  } catch (err) {
                    ctrl.error(err);
                  }
                }
              },
            }),
          };
        }
      }
    }
  }

  async subscribe(channelId: string, topic: 'tracker_status' | 'graph_sync'): Promise<void> {
    await this.http.request(`/subscription/${channelId}/${topic}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    }, this.http.channelBaseUrl);
  }

  async *iterateEvents(stream: ReadableStream<Uint8Array>): AsyncGenerator<ChannelEvent> {
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        yield JSON.parse(trimmed) as ChannelEvent;
      }
    }
    if (buffer.trim()) {
      yield JSON.parse(buffer.trim()) as ChannelEvent;
    }
  }
}
