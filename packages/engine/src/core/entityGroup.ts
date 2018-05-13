import EventEmitter from '@invictus/engine/utils/eventEmitter';
import { Subject } from 'rxjs';
import EntityManager from "./entityManager";


export enum EntityGroupEvents {
  ADD,
  REMOVE,
}

export default class EntityGroup extends EventEmitter<EntityGroupEvents> {
  public entityIDs: Set<number>;
  public addedEntities$: Subject<number[]>;
  public removedEntities$: Subject<number[]>;

  private manager: EntityManager;
  private requiredComponents: string[];

  constructor(manager: EntityManager, requiredComponents: string[]) {
    super();
    this.manager = manager;
    this.requiredComponents = requiredComponents;
    this.entityIDs = new Set();

    for (const comp of requiredComponents) {
      if (!this.manager.isComponent(comp)) {
        throw new Error(`Component ${comp} not found`);
      }
    }

    let valid;
    this.manager.addComponentWatchers.push((entityID: number) => {
      valid = true;
      for (const comp of this.requiredComponents) {
        if (!this.manager.hasComponent(entityID, comp)) {
          valid = false;
        }
      }
      if (valid) {
        this.entityIDs.add(entityID);
        this.emit(EntityGroupEvents.ADD, entityID);
      }
    });

    this.manager.removeEntityWatchers.push((entityID: number) => {
      this.entityIDs.delete(entityID);
      this.emit(EntityGroupEvents.REMOVE, entityID);
    });
  }

  public onEntityAdded(entityID: number) {}
  public onEntityRemoved(entityID: number) {}
}
