export interface TractiveSession {
  user_id: string;
  client_id: string;
  expires_at: number;
  access_token: string;
  scope?: string | null;
}

export interface TractiveClientOptions {
  graphBaseUrl?: string;
  channelBaseUrl?: string;
  appId?: string;
  appBuild?: string;
  appVersion?: string;
  session?: TractiveSession;
}

export interface ObjectSelector {
  _type: string;
  _id: string;
}

export interface ApiErrorShape {
  code?: number;
  category?: string;
  message?: string;
  detail?: string | null;
}

export interface ChannelHandshakeEvent {
  message: 'handshake';
  channel_id: string;
  persistant: boolean;
  keep_alive_ttl: number;
}

export interface ChannelKeepAliveEvent {
  message: 'keep-alive';
  channelId: string;
  keepAlive: number;
}

export interface ControlStatePayload {
  active: boolean;
  timeout: number;
  remaining: number;
  pending: boolean;
  reconnecting: boolean;
  started_at?: number;
}

export interface PositionPayload {
  time?: number;
  time_rcvd?: number;
  latlong?: [number, number];
  sensor_used?: string;
  nearby_user_id?: string;
  power_saving_zone_id?: string | null;
  accuracy?: number;
  speed?: number;
  course?: number;
  altitude?: number;
}

export interface HardwarePayload {
  time?: number;
  battery_level?: number;
  clip_mounted_state?: boolean;
  temperature_state?: string | null;
  power_saving_zone_id?: string | null;
}

export interface TrackerStatusEvent {
  message: 'tracker_status';
  tracker_id: string;
  tracker_state?: string;
  tracker_state_reason?: string | null;
  power_saving_zone_id?: string | null;
  charging_state?: string;
  battery_state?: string;
  position?: PositionPayload;
  hardware?: HardwarePayload;
  live_tracking?: ControlStatePayload;
  led_control?: ControlStatePayload;
  buzzer_control?: ControlStatePayload;
}

export interface GraphSyncTarget {
  _id: string;
  _type: string;
  recursive?: boolean;
}

export interface GraphSyncEvent {
  message: 'graph_sync';
  user_id: string;
  targets: GraphSyncTarget[];
}

export type ChannelEvent = ChannelHandshakeEvent | ChannelKeepAliveEvent | TrackerStatusEvent | GraphSyncEvent | Record<string, unknown>;
