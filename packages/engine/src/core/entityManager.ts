import EntityAttribute from './entityAttribute';
import EntityBehavior from './entityBehavior';
import EventEmitter from '@invictus/engine/utils/eventEmitter';
import Entity from './entity';
import { Constructable, InstanceMap } from './types';


export default class EntityManager {
  entities: Set<Entity>;
  entityMap: { [entityID: number]: Entity };

  constructor() {
    this.entities = new Set();
    this.entityMap = {};
  }

  get entityCount(): number {
    return this.entities.size;
  }

  addEntity(entity: Entity) {
    const id = this.entityCount + 1;
    this.entities[id] = entity;
    entity.id = id;
    this.entities.add(entity);
  }

  removeEntity(entity: Entity) {
    this.entities.delete(entity);
    delete this.entities[entity.id];
  }

  createEntity(
    attributes: [Constructable<EntityAttribute>, any][] = [],
    behaviors: Constructable<EntityBehavior>[] = [],
  ): Entity {
    const entity = new Entity();
    for (const item of attributes) {
      entity.addAttribute(item[0], item[1]);
    }

    for (const behavior of behaviors) {
      entity.addBehavior(behavior);
    }
    this.addEntity(entity);
    return entity;
  }
}
