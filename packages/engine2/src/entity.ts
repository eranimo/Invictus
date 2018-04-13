import EntityAttribute from './entityAttribute';
import EntityBehavior from './entityBehavior';
import EventEmitter from './eventEmitter';


type Constructor<T> = new (...args: any[]) => T;
type InstanceMap<T> = Map<Constructor<T>, T>

export default class Entity extends EventEmitter {
  id: number; // unique
  attributes: InstanceMap<EntityAttribute<any>>;
  behaviors: InstanceMap<EntityBehavior>;

  constructor() {
    super();
    this.attributes = new Map();
    this.behaviors = new Map();
  }

  addAttribute<T>(
    attributeClass: Constructor<EntityAttribute<T>>,
    initialValue: any
  ): EntityAttribute<T> {
    const attrubute: EntityAttribute<T> = new attributeClass(this, initialValue);
    this.attributes.set(attributeClass, attrubute);
    return attrubute;
  }

  removeAttribute<T>(
    attributeClass: Constructor<EntityAttribute<T>>
  ) {
    if (!this.attributes.has(attributeClass)) {
      throw new Error(`Attribute '${attributeClass.name}' not found`);
    }
    this.attributes.delete(attributeClass);
  }

  addBehavior(
    behaviorClass: Constructor<EntityBehavior>
  ): EntityBehavior {
    const behavior = new behaviorClass(this);
    this.behaviors.set(behaviorClass, behavior);
    behavior.onAdd();
    return behavior;
  }

  removeBehavior(
    behaviorClass: Constructor<EntityBehavior>
  ) {
    if (!this.behaviors.has(behaviorClass)) {
      throw new Error(`Behavior '${behaviorClass.name}' not found`);
    }
    const behavior = this.behaviors.get(behaviorClass);
    behavior.onRemove();
    this.behaviors.delete(behaviorClass);
  }
}
