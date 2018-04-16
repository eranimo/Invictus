import createTile from './prefabs/tile';
import EntityManager from './entityManager';
import Entity from './entity';


export type Prefab = (options: any) => Entity;
export interface Prefabs {
  [prefabName: string]: Prefab
}
export default function createPrefabs(manager: EntityManager): Prefabs {
  return {
    tile: createTile(manager)
  }
}
