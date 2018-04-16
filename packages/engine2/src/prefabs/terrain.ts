import { Coordinate } from './../types';
import Entity from './../entity';
import EntityManager from './../entityManager';
import { TileAttribute, ITile } from '../components/tile';
import { GridPositionAttribute } from '../components/grid';


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
