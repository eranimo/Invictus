import EntityAttribute from './entityAttribute';
import EntityBehavior from './entityBehavior';
import EventEmitter from './eventEmitter';


export interface Constructable<T> {
  new(...args): T;
  prototype: T
}
export type InstanceMap<T> = Map<Constructable<T>, T>

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
    const canUseBehavior = behavior.verify();
    if (!canUseBehavior) {
      throw new Error(`Behavior '${behaviorClass.name}' missing required attributes`);
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
}
