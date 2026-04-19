import { AuthApi } from './auth.js';
import { ChannelApi } from './channel.js';
import { GraphApi } from './graph.js';
import { HttpClient } from './http.js';
import { PetsApi } from './resources/pets.js';
import { SubscriptionsApi } from './resources/subscriptions.js';
import { TrackersApi } from './resources/trackers.js';
import { UsersApi } from './resources/users.js';
import type { TractiveClientOptions } from './types.js';

export class TractiveClient {
  readonly http: HttpClient;
  readonly auth: AuthApi;
  readonly graph: GraphApi;
  readonly users: UsersApi;
  readonly trackers: TrackersApi;
  readonly pets: PetsApi;
  readonly subscriptions: SubscriptionsApi;
  readonly channel: ChannelApi;

  constructor(options: TractiveClientOptions = {}) {
    this.http = new HttpClient(options);
    this.auth = new AuthApi(this.http);
    this.graph = new GraphApi(this.http);
    this.users = new UsersApi(this.graph);
    this.trackers = new TrackersApi(this.graph);
    this.pets = new PetsApi(this.graph);
    this.subscriptions = new SubscriptionsApi(this.graph);
    this.channel = new ChannelApi(this.http);
  }
}
