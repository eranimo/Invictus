import { IGridPosition } from '@invictus/engine/components/grid';
import { ITileComponent } from '@invictus/engine/components/tile';
import EntityManager from '@invictus/engine/core/entityManager';

interface ITerrainOptions {
  position: IGridPosition;
  tile: ITileComponent;
}
export default function createTerrain(manager: EntityManager): (options: ITerrainOptions) => number {
  return (options: ITerrainOptions): number => {
    const entityID = manager.createEntity();
    manager.addComponent<IGridPosition>(entityID, 'GridPositionComponent', options.position);
    manager.addComponent<ITileComponent>(entityID, 'TileComponent', options.tile);
    return entityID;
  };
}
