import { Coordinate } from './../types';
import Entity from './../entity';
import EntityAttribute from './../entityAttribute';
import EntityBehavior from './../entityBehavior';
import EntityManager from './../entityManager';


export class PositionAttribute extends EntityAttribute<Coordinate> {
  onChange(value: Coordinate) {
    value.x = Math.min();
    return value;
  }
}


export interface ITile {
  tileset: string,
  tileName: string;
  colorReplacements: any;
}
export class TileAttribute extends EntityAttribute<ITile> { }

export class TileBehavior extends EntityBehavior {
  static requirements = [TileAttribute];

  onAdd() {
    const tile: TileAttribute = this.getAttribute(TileAttribute);
  }
}


export default function createTile(manager: EntityManager): (options: ITile) => Entity {
  return (options: ITile): Entity => {
    return manager.createEntity([
      [TileAttribute, options]
    ], [TileBehavior]);
  }
}
