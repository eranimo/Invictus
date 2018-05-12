import EntityManager from '@invictus/engine/core/entityManager';
import { ITileComponent } from '@invictus/engine/components/tile';
import { IGridPosition } from '@invictus/engine/components/grid';


interface TerrainOptions {
  position: IGridPosition;
  tile: ITileComponent;
};
export default function createTerrain(manager: EntityManager): (options: TerrainOptions) => number {
  return (options: TerrainOptions): number => {
    const entityID = manager.createEntity();
    manager.addComponent<IGridPosition>(entityID, 'GridPositionComponent', options.position);
    manager.addComponent<ITileComponent>(entityID, 'TileComponent', options.tile);
    return entityID;
  }
}
