import Component from '@invictus/engine/core/component';
import { Point } from 'pixi.js';


export interface IGridPosition {
  x: number;
  y: number;
}
export class GridPositionComponent extends Component<IGridPosition> {
  public static defaultValue = {
    x: null,
    y: null,
  };

  public point: Point;

  public onChange() {
    this.point = new Point(this.get('x'), this.get('y'));
    Object.freeze(this.point);
  }
}
