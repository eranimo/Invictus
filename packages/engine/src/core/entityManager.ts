import { Constructable, InstanceMap } from './types';
import Component from './component';
import { ObservableMap, ObservableSet } from 'observable-collection';


export type ComponentMap = ObservableMap<string, Component<any>>;
export type EntityMap = ObservableMap<number, ComponentMap>;
export type ComponentClassMap = ObservableMap<string, Constructable<Component<any>>>;

export default class EntityManager {
  entityMap: EntityMap;
  private knownComponents: ComponentClassMap;

  constructor() {
    this.entityMap = new ObservableMap();
    this.knownComponents = new ObservableMap();
  }

  get entityCount(): number {
    return this.entityMap.size;
  }

  registerComponent<T>(name: string, componentClass: Constructable<Component<T>>) {
    this.knownComponents.set(name, componentClass);
  }

  isComponent(component: string): boolean {
    return this.knownComponents.has(component);
  }

  createEntity(): number {
    const id = this.entityCount + 1;
    const entity: ComponentMap = new ObservableMap<string, Component<any>>([]);
    this.entityMap.set(id, entity);
    return id;
  }

  hasEntity(entityID: number): boolean {
    return this.entityMap.has(entityID);
  }

  getEntity(entityID: number): ComponentMap {
    if (!this.hasEntity(entityID)) {
      throw new Error(`Entity ${entityID} not found`);
    }
    return this.entityMap.get(entityID);
  }

  removeEntity(entityID): boolean {
    return this.entityMap.delete(entityID);
  }

  addComponent<T>(entityID: number, component: string, data: T): Component<T> {
    const entity = this.getEntity(entityID);
    if (!this.isComponent(component)) {
      throw new Error(`Component ${component} not found`);
    }
    const compClass = this.knownComponents.get(component);
    const componentInstance = new compClass(data);
    entity.set(component, componentInstance);
    return componentInstance as Component<T>;
  }

  getComponent<T extends Component<any>>(entityID: number, component: string): T {
    const entity = this.getEntity(entityID);
    return entity.get(component) as T;
  }

  removeComponent(entityID: number, component: string) {
    const entity = this.getEntity(entityID);
    entity.delete(component);
  }

  hasComponent(entityID: number, component: string): boolean {
    const entity = this.getEntity(entityID);
    return entity.has(component);
  }
}
