import EntityAttribute from './entityAttribute';
import EntityBehavior from './entityBehavior';
import EventEmitter from './eventEmitter';


export default class Entity extends EventEmitter {
  id: number; // unique
  attributes: Map<string, EntityAttribute<any>>;
  behaviors: Map<string, EntityBehavior>;

  constructor() {
    super();
    this.attributes = new Map();
    this.behaviors = new Map();
  }

  addAttribute<T>(
    name: string,
    attribute: EntityAttribute<T>
  ) {
    this.attributes.set(name, attribute);
  }

  removeAttribute<T>(name: string) {
    if (!this.attributes.has(name)) {
      throw new Error(`Attribute '${name}' not found`);
    }
    this.attributes.delete(name);
  }

  addBehavior(
    name: string,
    behavior: EntityBehavior
  ) {
    this.behaviors.set(name, behavior);
    behavior.onAdd();
  }

  removeBehavior(name: string) {
    if (!this.behaviors.has(name)) {
      throw new Error(`Behavior '${name}' not found`);
    }
    const behavior = this.behaviors.get(name);
    behavior.onRemove();
    this.behaviors.delete(name);
  }
}
