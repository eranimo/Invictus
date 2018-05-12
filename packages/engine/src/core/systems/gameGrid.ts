import ndarray from 'ndarray';
import { Point } from 'pixi.js';

import { System, ReactiveSystem } from '../system';
import Scene from '../scene';
import fill from 'ndarray-fill';
import { Coordinate } from '../types';
import EventEmitter from '@invictus/engine/utils/eventEmitter';
// import { GridPositionAttribute, GRID_POSITION_EVENTS } from '@invictus/engine/components/grid';
import Game, { UIEvents } from '../game';
import { GridPositionComponent, IGridPosition } from '@invictus/engine/components';
import { Subscription } from 'rxjs';


interface IGameGridSettings {
  width: number;
  height: number;
};

export enum GameGridEvents {
  CELL_CHANGED
};


/**
 * Listens for entities with GridPositionComponent and creates a 2D map
 * of all entities in the grid at each position
 */
export class GameGridSystem extends ReactiveSystem {
  static systemName = 'GameGrid';
  static requiredComponents = ['GridPositionComponent'];

  public size: { width: number, height: number };
  /** A mapping between grid positions and the set of entities at that position */
  private positionToEntitySet: ndarray<Set<number>>;

  /** A mapping of entity IDs to their positions */
  private entityToPositionMap: Map<number, [number, number]>;

  init(settings: IGameGridSettings) {
    console.log(`[GameGridSystem] Init`);
    this.size = { width: settings.width, height: settings.height };
    this.positionToEntitySet = ndarray([], [settings.width, settings.height]);
    fill(this.positionToEntitySet, () => new Set());

    this.entityToPositionMap = new Map();
  }

  protected onEntityAdded(entityID: number) {
    console.log(`[GameGridSystem] Entity added: ${entityID}`);

    const pos = this.manager.getComponent<GridPositionComponent>(entityID, 'GridPositionComponent');
    const entities = this.positionToEntitySet.get(pos.get('x'), pos.get('y'));
    entities.add(entityID);
    this.entityToPositionMap.set(entityID, [pos.get('x'), pos.get('y')])
    super.onEntityAdded(entityID);
  }

  protected onEntityRemoved(entityID: number) {
    console.log(`[GameGridSystem] Entity removed: ${entityID}`);
    const [x, y] = this.entityToPositionMap.get(entityID);
    const entities = this.positionToEntitySet.get(x, y);
    entities.delete(entityID);
    this.entityToPositionMap.delete(entityID);
    super.onEntityRemoved(entityID);
  }

  protected handleChanges(entityID: number, component: string, oldValue: any, newValue: any) {
    console.log(`[GameGridSystem] Entity changed: ${entityID}`, newValue);
    const oldPosition = this.entityToPositionMap.get(entityID);
    let set = this.positionToEntitySet.get(oldPosition[0], oldPosition[1]);
    set.delete(entityID);
    set = this.positionToEntitySet.get(newValue.x, newValue.y);
    if (set === undefined) {
      throw new Error(`Entity '${entityID}' position is out of grid`);
    }
    set.add(entityID);
    this.entityToPositionMap.set(entityID, [newValue.x, newValue.y]);
  }

  public getCell(x: number, y: number): Set<number> {
    return this.positionToEntitySet.get(x, y);
  }

  public isValid(x: number, y: number): boolean {
    return x > 0 && y > 0 && x < this.size.width && y < this.size.height;
  }
}
