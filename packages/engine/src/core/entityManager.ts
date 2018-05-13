import { ObservableMap } from 'observable-collection';
import Component from './component';
import { IConstructable } from './types';


export type ComponentMap = ObservableMap<string, Component<any>>;
export type EntityMap = ObservableMap<number, ComponentMap>;
export type ComponentClassMap = ObservableMap<string, IConstructable<Component<any>>>;

export default class EntityManager {
  public entityMap: EntityMap;
  public addComponentWatchers: Array<(entityID: number, component: string) => void>;
  public removeEntityWatchers: Array<(entityID: number) => void>;
  private knownComponents: ComponentClassMap;

  constructor() {
    this.entityMap = new ObservableMap();
    this.knownComponents = new ObservableMap();
    this.addComponentWatchers = [];
    this.removeEntityWatchers = [];
  }

  get entityCount(): number {
    return this.entityMap.size;
  }

  public registerComponent<T>(name: string, componentClass: IConstructable<Component<T>>) {
    this.knownComponents.set(name, componentClass);
  }

  public isComponent(component: string): boolean {
    return this.knownComponents.has(component);
  }

  public createEntity(): number {
    const id = this.entityCount + 1;
    const entity: ComponentMap = new ObservableMap<string, Component<any>>([]);
    this.entityMap.set(id, entity);
    return id;
  }

  public hasEntity(entityID: number): boolean {
    return this.entityMap.has(entityID);
  }

  public getEntity(entityID: number): ComponentMap {
    if (!this.hasEntity(entityID)) {
      throw new Error(`Entity ${entityID} not found`);
    }
    return this.entityMap.get(entityID);
  }

  public removeEntity(entityID): boolean {
    for (const func of this.removeEntityWatchers) {
      func(entityID);
    }
    return this.entityMap.delete(entityID);
  }

  public addComponent<T>(entityID: number, component: string, data: T): Component<T> {
    const entity = this.getEntity(entityID);
    if (!this.isComponent(component)) {
      throw new Error(`Component ${component} not found`);
    }
    const compClass = this.knownComponents.get(component);
    const componentInstance = new compClass(data);
    entity.set(component, componentInstance);
    for (const func of this.addComponentWatchers) {
      func(entityID, component);
    }
    return componentInstance as Component<T>;
  }

  public getComponent<T extends Component<any>>(entityID: number, component: string): T {
    const entity = this.getEntity(entityID);
    return entity.get(component) as T;
  }

  public removeComponent(entityID: number, component: string) {
    const entity = this.getEntity(entityID);
    entity.delete(component);
  }

  public hasComponent(entityID: number, component: string): boolean {
    const entity = this.getEntity(entityID);
    return entity.has(component);
  }
}
