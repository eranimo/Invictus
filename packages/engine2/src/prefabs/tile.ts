import { Coordinate } from './../types';
import Entity from './../entity';
import EntityManager from './../entityManager';
import { TileAttribute, ITile } from '../components/tile';


export default function createTile(manager: EntityManager): (options: ITile) => Entity {
  return (options: ITile): Entity => {
    return manager.createEntity([
      [TileAttribute, options]
    ], []);
  }
}
