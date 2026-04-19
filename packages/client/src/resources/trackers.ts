import { GraphApi } from '../graph.js';

export class TrackersApi {
  constructor(private readonly graph: GraphApi) {}

  getTracker<T = unknown>(trackerId: string): Promise<T> {
    return this.graph.get<T>('tracker', trackerId);
  }

  async getTrackerPositionReport<T = unknown>(trackerId: string): Promise<T | undefined> {
    const refs = await this.graph.getRelation<Array<{ _id: string; _type: string }>>('tracker', trackerId, 'device_pos_report');
    const ref = refs?.[0];
    if (!ref?._id) return undefined;
    return this.graph.get<T>('device_pos_report', ref._id);
  }

  async getTrackerHardwareReport<T = unknown>(trackerId: string): Promise<T | undefined> {
    const refs = await this.graph.getRelation<Array<{ _id: string; _type: string }>>('tracker', trackerId, 'device_hw_report');
    const ref = refs?.[0];
    if (!ref?._id) return undefined;
    return this.graph.get<T>('device_hw_report', ref._id);
  }

  getTrackerGeofences<T = unknown>(trackerId: string): Promise<T> {
    return this.graph.getRelation<T>('tracker', trackerId, 'geofences');
  }

  setLiveTracking<T = unknown>(trackerId: string, enabled: boolean): Promise<T> {
    return this.graph.getRelation<T>('tracker', trackerId, `command/live_tracking/${enabled ? 'on' : 'off'}`);
  }

  setLed<T = unknown>(trackerId: string, enabled: boolean): Promise<T> {
    return this.graph.getRelation<T>('tracker', trackerId, `command/led_control/${enabled ? 'on' : 'off'}`);
  }

  setBuzzer<T = unknown>(trackerId: string, enabled: boolean): Promise<T> {
    return this.graph.getRelation<T>('tracker', trackerId, `command/buzzer_control/${enabled ? 'on' : 'off'}`);
  }
}
