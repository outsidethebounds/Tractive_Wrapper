import { GraphApi } from '../graph.js';

export class PetsApi {
  constructor(private readonly graph: GraphApi) {}

  getPet<T = unknown>(petId: string): Promise<T> {
    return this.graph.get<T>('pet', petId);
  }

  getTrackableObject<T = unknown>(trackableObjectId: string): Promise<T> {
    return this.graph.get<T>('trackable_object', trackableObjectId);
  }
}
