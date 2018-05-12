import createTerrain from '@invictus/engine/prefabs/terrain';
import EntityManager from './entityManager';


export type Prefab = (options: any) => number;
export interface Prefabs {
  [prefabName: string]: Prefab
}
export default function createPrefabs(manager: EntityManager): Prefabs {
  return {
    terrain: createTerrain(manager)
  }
}
