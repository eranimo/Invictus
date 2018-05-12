import { Subscription } from 'rxjs';
import Component from './component';
import EntityGroup from './entityGroup';
import EntityManager, { ComponentMap } from './entityManager';
import Scene from './scene';

export abstract class System {
  public static systemName: string;
  public static requiredComponents: string[];

  public manager: EntityManager;
  public group: EntityGroup;
  public scene: Scene;

  constructor(scene: Scene, manager: EntityManager) {
    this.scene = scene;
    this.manager = manager;
    const requiredComponents = new.target.requiredComponents || [];
    this.group = new EntityGroup(this.manager, requiredComponents);
    console.log(this.group);
    this.group.addedEntities$.subscribe((entityIDs) =>
      entityIDs.forEach(this.onEntityAdded.bind(this)),
    );
    this.group.removedEntities$.subscribe((entityIDs) =>
      entityIDs.forEach(this.onEntityRemoved.bind(this)),
    );
    this.group.watch();
  }

  public init(options: any) {}

  get entities(): Set<number> {
    return this.group.entityIDs;
  }

  get systems() {
    return this.scene.systemMap;
  }

  get game() {
    return this.scene.game;
  }

  public process(elapsedTime: number) {
    for (const entityID of this.group.entityIDs) {
      this.processEntity(entityID, elapsedTime);
    }
  }

  // signals
  protected onEntityAdded(entityID: number) {}
  protected onEntityRemoved(entityID: number) {}

  // methods
  protected processEntity(entityID: number, elapsedTime: number) {}

  protected getEntity(entityID: number): ComponentMap {
    return this.manager.getEntity(entityID);
  }
}

export abstract class ReactiveSystem extends System {
  private subscriptions: Map<Component<any>, Subscription>;

  constructor(scene: Scene, manager: EntityManager) {
    super(scene, manager);
    this.subscriptions = new Map();
  }

  protected onEntityAdded(entityID: number) {
    for (const name of (this.constructor as any).requiredComponents as string[]) {
      const comp: Component<any> = this.manager.getComponent(entityID, name);
      let oldValue = Object.assign({}, comp.value);
      const subscription: Subscription = comp.subscribe((newValue) => {
        this.handleChanges(entityID, name, oldValue, comp.value);
        oldValue = Object.assign({}, comp.value);
      });
      this.subscriptions.set(comp, subscription);
    }
  }

  protected onEntityRemoved(entityID: number) {
    for (const name of (this.constructor as any).requiredComponents as string[]) {
      const comp: Component<any> = this.manager.getComponent(entityID, name);
      this.subscriptions.get(comp).unsubscribe();
    }
  }

  protected handleChanges(entityID: number, component: string, oldValue: any, newValue: any) {}
}
