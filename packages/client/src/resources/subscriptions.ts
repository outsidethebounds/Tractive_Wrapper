import { GraphApi } from '../graph.js';

export class SubscriptionsApi {
  constructor(private readonly graph: GraphApi) {}

  getSubscription<T = unknown>(subscriptionId: string): Promise<T> {
    return this.graph.get<T>('subscription', subscriptionId);
  }

  getRenewalInformation<T = unknown>(subscriptionId: string): Promise<T> {
    return this.graph.getRelation<T>('subscription', subscriptionId, 'renewal_information');
  }
}
