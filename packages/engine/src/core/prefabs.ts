import createTerrain from '@invictus/engine/prefabs/terrain';
import EntityManager from './entityManager';
import Entity from './entity';


export type Prefab = (options: any) => Entity;
export interface Prefabs {
  [prefabName: string]: Prefab
}
export default function createPrefabs(manager: EntityManager): Prefabs {
  return {
    terrain: createTerrain(manager)
  }
}
