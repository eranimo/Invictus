import Component from '@invictus/engine/core/component';
import { Point } from 'pixi.js';


/*
import EntityAttribute from '@invictus/engine/core/entityAttribute';
import EntityBehavior from '@invictus/engine/core/entityBehavior';
import GameGrid from '@invictus/engine/core/gameGrid';
import { Coordinate } from '@invictus/engine/core/types';


export const GRID_POSITION_EVENTS = {
  ADDED_TO_GRID: 'ADDED_TO_GRID',
};

export class GridPositionAttribute extends EntityAttribute<Coordinate> {
  gameGrid: GameGrid;

  onInit() {
    this.onEntityEvent(GRID_POSITION_EVENTS.ADDED_TO_GRID, (value: GameGrid) => {
      this.gameGrid = value;
    });
  }

  onChange(value: Coordinate) {
    if (
      this.gameGrid &&
      (value.x < 0 ||
      value.y < 0 ||
      value.x > this.gameGrid.settings.width ||
      value.y > this.gameGrid.settings.height)
    ) {
      throw new Error('Invalid GridPositionAttribute value');
    }
    return value;
  }

  moveRight() {
    const newValue = {
      x: this.value.x + 1,
      y: this.value.y
    };
    if (this.gameGrid.isValid(newValue.x, newValue.y)) {
      this.value = newValue;
    }
  }
}

export const GRID_INPUT_EVENTS = {
  'CELL_EVENT': 'CELL_EVENT'
}

export class GridInputBehavior extends EntityBehavior {
  static requirements = [GridPositionAttribute];

  onAdd() {
    const gridPosition = this.getAttribute(GridPositionAttribute);
    this.onEntityEvent(GRID_INPUT_EVENTS.CELL_EVENT, (eventName, event) => {
      if (eventName === 'click') {
        this.handleClick();
      } else if (eventName === 'mouseover') {
        console.log('mouse over!');
      }
    });
  }

  handleClick() {
    console.log('clicked!');
  }
}
*/

export interface IGridPosition {
  x: number;
  y: number;
}
export class GridPositionComponent extends Component<IGridPosition> {
  point: Point;

  static defaultValue = {
    x: null,
    y: null,
  };

  onChange() {
    this.point = new Point(this.get('x'), this.get('y'));
    Object.freeze(this.point);
  }
}
