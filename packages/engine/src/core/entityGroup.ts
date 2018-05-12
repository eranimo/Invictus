import EntityManager, { ComponentMap, EntityMap } from "./entityManager";
import { Subject, Observable, SubscriptionLike } from 'rxjs';


export default class EntityGroup {
  public entityIDs: Set<number>;
  public addedEntities$: Subject<number[]>;
  public removedEntities$: Subject<number[]>;

  private manager: EntityManager;
  private requiredComponents: string[];
  private entityWatcher$: Subject<EntityMap>;
  private componentWatcher$: Subject<ComponentMap>;
  private entityWatcherSubscription$: SubscriptionLike;
  private componentWatcherSubscription$: SubscriptionLike;

  constructor(manager: EntityManager, requiredComponents: string[]) {
    this.manager = manager;
    this.requiredComponents = requiredComponents;
    this.entityIDs = new Set();

    for (const comp of requiredComponents) {
      if (!this.manager.isComponent(comp)) {
        throw new Error(`Component ${comp} not found`);
      }
    }
    this.entityWatcher$ = new Subject();
    this.componentWatcher$ = new Subject();
    this.addedEntities$ = new Subject();
    this.removedEntities$ = new Subject();
  }

  /** Rebuild entity list based on current state of the world */
  private handleChanges() {
    const entityIDs = new Set();
    for (const [entityID, entityComponents] of this.manager.entityMap.entries()) {
      let valid = true;
      for (const reqComp of this.requiredComponents) {
        if (!entityComponents.has(reqComp)) {
          valid = false;
        }
      }
      if (valid) {
        entityIDs.add(entityID);
      }
    }
    // entity added
    const added = [];
    for (const newID of entityIDs) {
      if (!this.entityIDs.has(newID)) {
        added.push(newID);
      }
    }
    this.addedEntities$.next(added);

    // entity removed
    const removed = [];
    for (const oldID of this.entityIDs) {
      if (!entityIDs.has(oldID)) {
        removed.push(oldID);
      }
    }
    this.removedEntities$.next(removed);
    this.entityIDs = entityIDs;
  }

  /** Watch for entity changes */
  public watch() {
    this.manager.entityMap.subscribe(this.entityWatcher$);
    this.manager.entityMap.subscribe(entityMap => {
      for (const [entityID, components] of this.manager.entityMap.entries()) {
        components.subscribe(this.componentWatcher$);
      }
    });
    this.entityWatcher$.subscribe(this.handleChanges.bind(this));
    this.componentWatcher$.subscribe(this.handleChanges.bind(this));
  }

  /** Stop watching for entity changes */
  public unwatch() {
    this.entityWatcherSubscription$.unsubscribe();
    this.componentWatcherSubscription$.unsubscribe();
  }

  /** Gets all the specified components in the entity group */
  public getComponents(...components: string[]) {

  }
}
