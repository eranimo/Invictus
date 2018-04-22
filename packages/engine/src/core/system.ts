import Entity from './entity';
import EntityManager from './entityManager';
import EntityAttribute from '@invictus/engine/core/entityAttribute';
import EntityBehavior from '@invictus/engine/core/entityBehavior';
import { Constructable, InstanceMap } from './types';
import EventEmitter from '@invictus/engine/utils/eventEmitter';


export default class System extends EventEmitter {
  public entities: Set<Entity>;
  requiredAttributes: Constructable<EntityAttribute>[];
  requiredBehaviors: Constructable<EntityBehavior>[];

  constructor(
    requiredAttributes: Constructable<EntityAttribute>[] = [],
    requiredBehaviors: Constructable<EntityBehavior>[] = [],
  ) {
    super();
    this.requiredAttributes = requiredAttributes;
    this.requiredBehaviors = requiredBehaviors;
    this.entities = new Set();
  }

  public isValid(entity: Entity) {
    for (const attr of this.requiredAttributes) {
      if (!entity.attributes.has(attr)) {
        return false;
      }
    }

    for (const behavior of this.requiredBehaviors) {
      if (!entity.behaviors.has(behavior)) {
        return false;
      }
    }
    return true;
  }

  public addEntity(entity: Entity) {
    this.entities.add(entity);
    this.emit('add', entity);
  }

  public removeEntity(entity: Entity) {
    if (this.entities.has(entity)) {
      this.entities.delete(entity);
      this.emit('remove', entity);
    }
  }

  public clear() {
    this.entities = new Set();
  }

  onEntityAdded(entity: Entity) {}
  onEntityRemoved(entity: Entity) {}
}
