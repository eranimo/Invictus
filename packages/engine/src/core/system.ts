import EntityGroup from './entityGroup';
import Scene from './scene';
import EntityManager, { ComponentMap } from './entityManager';


export default abstract class System {
  manager: EntityManager;
  group: EntityGroup;
  scene: Scene;

  static systemName: string;
  static requiredComponents: string[];

  constructor(scene: Scene, manager: EntityManager) {
    this.scene = scene;
    this.manager = manager;
    const requiredComponents = new.target.requiredComponents || [];
    this.group = new EntityGroup(this.manager, requiredComponents);
    console.log(this.group);
    this.group.addedEntities$.subscribe(entityIDs =>
      entityIDs.forEach(this.onEntityAdded.bind(this))
    );
    this.group.removedEntities$.subscribe(entityIDs =>
      entityIDs.forEach(this.onEntityRemoved.bind(this))
    );
    this.group.watch();
  }

  init(options: any) {}

  get entities(): Set<number> {
    return this.group.entityIDs;
  }

  get systems() {
    return this.scene.systemMap;
  }

  get game() {
    return this.scene.game;
  }

  // signals
  protected onEntityAdded(entityID: number) {}
  protected onEntityRemoved(entityID: number) {}

  // methods
  protected processEntity(entityID: number, elapsedTime: number) {}

  public process(elapsedTime: number) {
    for (const entityID of this.group.entityIDs) {
      this.processEntity(entityID, elapsedTime);
    }
  }

  protected getEntity(entityID: number): ComponentMap {
    return this.manager.getEntity(entityID);
  }
}
