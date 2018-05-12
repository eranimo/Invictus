import Component from '@invictus/engine/core/component';
import { ColorReplaceFilter } from 'pixi-filters';


export interface ITileComponent {
  tileset: string;
  tileName: string;
  colorReplacements: any;
  rotation: number;
  layer: number;
}
export class TileComponent extends Component<ITileComponent> {
  public filters: ColorReplaceFilter[];

  public onChange() {
    this.filters = [];
    for (const color of this.get('colorReplacements')) {
      const before = color[0].map((c) => c / 255);
      const after = color[1].map((c) => c / 255);
      const filter = new ColorReplaceFilter(before, after, .1);
      filter.resolution = window.devicePixelRatio;
      this.filters.push(filter);
    }
  }
}
