import EntityAttribute from '@invictus/engine/core/entityAttribute';
import EntityBehavior from '@invictus/engine/core/entityBehavior';
import EventEmitter from '../utils/eventEmitter';
import { Constructable, InstanceMap } from './types';


export default class Entity extends EventEmitter {
  id: number; // unique
  attributes: InstanceMap<EntityAttribute<any>>;
  behaviors: InstanceMap<EntityBehavior>;

  constructor() {
    super();
    this.attributes = new Map();
    this.behaviors = new Map();
  }

  addAttribute<T extends EntityAttribute>(
    attributeClass: Constructable<T>,
    initialValue: any
  ): T {
    const attrubute: T = new attributeClass(this, initialValue);
    this.attributes.set(attributeClass, attrubute);
    return attrubute;
  }

  getAttribute<T extends EntityAttribute>(
    attributeClass: Constructable<T>
  ): T {
    return this.attributes.get(attributeClass) as T;
  }

  removeAttribute<T>(
    attributeClass: Constructable<EntityAttribute<T>>
  ) {
    if (!this.attributes.has(attributeClass)) {
      throw new Error(`Attribute '${attributeClass.name}' not found`);
    }
    this.attributes.delete(attributeClass);
  }

  addBehavior<T extends EntityBehavior>(
    behaviorClass: Constructable<T>
  ): T {
    const behavior: T = new behaviorClass(this);
    const missingAttr = behavior.verify();
    if (missingAttr.length > 0) {
      throw new Error(`Behavior '${behaviorClass.name}' missing required attributes: ${missingAttr.join(', ')} (has ${this.attributeList.join(', ')})`);
    }
    this.behaviors.set(behaviorClass, behavior);
    behavior.onAdd();
    return behavior;
  }

  removeBehavior(
    behaviorClass: Constructable<EntityBehavior>
  ) {
    if (!this.behaviors.has(behaviorClass)) {
      throw new Error(`Behavior '${behaviorClass.name}' not found`);
    }
    const behavior = this.behaviors.get(behaviorClass);
    behavior.onRemove();
    this.behaviors.delete(behaviorClass);
  }

  hasAttributes(...attributes: Constructable<EntityAttribute>[]) {
    for (const attr of attributes) {
      if (!this.attributes.has(attr)) {
        return false;
      }
    }
    return true;
  }

  hasBehaviors(...behaviors: Constructable<EntityBehavior>[]) {
    for (const behavior of behaviors) {
      if (!this.behaviors.has(behavior)) {
        return false;
      }
    }
    return true;
  }

  get attributeList(): string[] {
    return Array.from(this.attributes.keys()).map(i => i.name);
  }

  get behaviorList(): string[] {
    return Array.from(this.behaviors.keys()).map(i => i.name);
  }
}
