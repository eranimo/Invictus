import { EntityPool } from 'entity-component-system';
import { isObject } from 'lodash';


export interface Prefab {
  name: string,
  state: ComponentMap;
}

type ComponentMap = { [componentName: string]: any };
type PrefabMap = { [prefabName: string]: ComponentMap };

export default class Prefabs {
  prefabs: PrefabMap;

  constructor(prefabs?: PrefabMap) {
    this.prefabs = prefabs;
  }

  /** Instantiates a prefab entity */
  instantiate(entities: EntityPool, prefabName: string) {
    const id = entities.create();
    const prefab = this.prefabs[prefabName];
    for (const [name, value] of Object.entries(prefab)) {
      const component = entities.addComponent(id, name);
      if (isObject(value)) {
        for (const [k, v] of Object.entries(value)) {
          component[k] = v;
        }
      } else {
        entities.setComponent(id, name, value);
      }
    }
  }

  registerPrefab(prefab: Prefab) {
    this.prefabs[prefab.name] = prefab.state;
  }
}
