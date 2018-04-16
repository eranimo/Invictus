import { Coordinate } from './../types';
import Entity from './../entity';
import EntityAttribute from './../entityAttribute';
import EntityBehavior from './../entityBehavior';
import EntityManager from './../entityManager';
import { ColorReplaceFilter } from 'pixi-filters';


export class PositionAttribute extends EntityAttribute<Coordinate> {
  onChange(value: Coordinate) {
    value.x = Math.max(0, value.x);
    value.y = Math.max(0, value.y);
    this.emitEntityEvent('NEW_POSITION', value);
    return value;
  }
}


export interface ITile {
  tileset: string,
  tileName: string;
  colorReplacements: any;
  rotation: number;
}
export class TileAttribute extends EntityAttribute<ITile> {
  filters: ColorReplaceFilter[];

  onChange(value) {
    if (value.rotation === undefined){
      value.rotation = 0;
    }
    if (value.colorReplacements) {
      this.filters = [];
      for (const color of value.colorReplacements) {
        const before = color[0].map(c => c / 255);
        const after = color[1].map(c => c / 255);
        const filter = new ColorReplaceFilter(before, after, .1);
        filter.resolution = window.devicePixelRatio;
        this.filters.push(filter);
      }
    }
    return value;
  }
}

export class TileBehavior extends EntityBehavior {
  static requirements = [TileAttribute];

  onAdd() {
    const tile = this.getAttribute(TileAttribute);
    this.onEntityEvent('TILE_INPUT', (eventName, event) => {
      if (eventName === 'click') {
        this.handleClick(event);
      }
    });
  }

  handleClick(event) {

  }
}


export default function createTile(manager: EntityManager): (options: ITile) => Entity {
  return (options: ITile): Entity => {
    return manager.createEntity([
      [TileAttribute, options]
    ], [TileBehavior]);
  }
}
