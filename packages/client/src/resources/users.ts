import { GraphApi } from '../graph.js';

export class UsersApi {
  constructor(private readonly graph: GraphApi) {}

  getUser<T = unknown>(userId: string): Promise<T> {
    return this.graph.get<T>('user', userId);
  }

  getUserTrackers<T = unknown>(userId: string): Promise<T> {
    return this.graph.getRelation<T>('user', userId, 'trackers');
  }

  getUserTrackableObjects<T = unknown>(userId: string): Promise<T> {
    return this.graph.getRelation<T>('user', userId, 'trackable_objects');
  }

  getUserSubscriptions<T = unknown>(userId: string): Promise<T> {
    return this.graph.getRelation<T>('user', userId, 'subscriptions');
  }

  getUserShares<T = unknown>(userId: string): Promise<T> {
    return this.graph.getRelation<T>('user', userId, 'shares');
  }
}
