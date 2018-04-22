import { Coordinate } from '@invictus/engine/core/types';
import Entity from '@invictus/engine/core/entity';
import EntityManager from '@invictus/engine/core/entityManager';
import { TileAttribute, ITile } from '@invictus/engine/components/tile';
import { GridPositionAttribute } from '@invictus/engine/components/grid';


interface TerrainOptions {
  position: Coordinate;
  tile: ITile;
};
export default function createTerrain(manager: EntityManager): (options: TerrainOptions) => Entity {
  return (options: TerrainOptions): Entity => {
    return manager.createEntity([
      [TileAttribute, options.tile],
      [GridPositionAttribute, options.position],
    ]);
  }
}
