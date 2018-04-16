import { ColorReplaceFilter } from 'pixi-filters';
import EntityAttribute from './../entityAttribute';
import EntityBehavior from './../entityBehavior';


export interface ITile {
  tileset: string,
  tileName: string;
  colorReplacements: any;
  rotation: number;
}

export class TileAttribute extends EntityAttribute<ITile> {
  filters: ColorReplaceFilter[];

  onChange(value) {
    if (value.rotation === undefined) {
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
