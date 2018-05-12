import ndarray from 'ndarray';
import { Point } from 'pixi.js';

import System from '../system';
import Scene from '../scene';
import fill from 'ndarray-fill';
import { Coordinate } from '../types';
import EventEmitter from '@invictus/engine/utils/eventEmitter';
// import { GridPositionAttribute, GRID_POSITION_EVENTS } from '@invictus/engine/components/grid';
import Game, { UIEvents } from '../game';
import { TilemapEvents } from '@invictus/engine/core/tilemap';
import { GridPositionComponent, IGridPosition } from '@invictus/engine/components';
import { Subscription } from 'rxjs';


interface IGameGridSettings {
  width: number;
  height: number;
};

export enum GameGridEvents {
  CELL_CHANGED
};


export default class GameGridSystem extends System {
  static systemName = 'GameGrid';
  static requiredComponents = ['GridPositionComponent'];

  private selectedCells: ndarray<number>;
  private selectedCellCount: number;

  public size: { width: number, height: number };
  public hoverCell: Point | null;

  /** A mapping between grid positions and the set of entities at that position */
  private positionToEntitySet: ndarray<Set<number>>;

  /** A mapping of entity IDs to their positions */
  private entityToPositionMap: Map<number, [number, number]>;

  /** RXJS Subscriptions on entity positions */
  private entitySubscriptions: Map<number, Subscription>;

  init(settings: IGameGridSettings) {
    console.log(`[GameGridSystem] Init`);
    this.size = { width: settings.width, height: settings.height };
    this.positionToEntitySet = ndarray([], [settings.width, settings.height]);
    fill(this.positionToEntitySet, () => new Set());

    this.entityToPositionMap = new Map();
    this.entitySubscriptions = new Map();

    this.selectedCells = ndarray([], [settings.width, settings.height]);
    fill(this.selectedCells, () => 0);

    this.selectedCellCount = 0;
    this.hoverCell = null;

    this.game.input.on('esc', () => {
      console.log('unselect all cells');
      this.unselectAll();
    })
  }

  onEntityAdded(entityID: number) {
    console.log(`[GameGridSystem] Entity added: ${entityID}`);

    const pos = this.manager.getComponent<GridPositionComponent>(entityID, 'GridPositionComponent');
    const entities = this.positionToEntitySet.get(pos.get('x'), pos.get('y'));
    entities.add(entityID);
    this.entityToPositionMap.set(entityID, [pos.get('x'), pos.get('y')])
    const subscription: Subscription = pos.subscribe(this.handleEntityChange(entityID));
    this.entitySubscriptions.set(entityID, subscription);
  }

  onEntityRemoved(entityID: number) {
    console.log(`[GameGridSystem] Entity removed: ${entityID}`);
    const [x, y] = this.entityToPositionMap.get(entityID);
    const entities = this.positionToEntitySet.get(x, y);
    entities.delete(entityID);
    this.entityToPositionMap.delete(entityID);
    this.entitySubscriptions.get(entityID).unsubscribe();
  }

  handleEntityChange(entityID: number) {
    return (newPosition: IGridPosition) => {
      console.log(`[GameGridSystem] Entity changed: ${entityID}`, newPosition);
      const oldPosition = this.entityToPositionMap.get(entityID);
      let set = this.positionToEntitySet.get(oldPosition[0], oldPosition[1]);
      set.delete(entityID);
      set = this.positionToEntitySet.get(newPosition.x, newPosition.y);
      if (set === undefined) {
        throw new Error(`Entity '${entityID}' position is out of grid`);
      }
      set.add(entityID);
      this.entityToPositionMap.set(entityID, [newPosition.x, newPosition.y]);
    };
  }

  public getCell(x: number, y: number): Set<number> {
    return this.positionToEntitySet.get(x, y);
  }

  public isValid(x: number, y: number): boolean {
    return x > 0 && y > 0 && x < this.size.width && y < this.size.height;
  }

  public isCellSelected(coord: Point): boolean {
    return this.selectedCells.get(coord.x, coord.y) === 1;
  }

  public selectCell(coord: Point) {
    this.selectedCells.set(coord.x, coord.y, 1);
    this.selectedCellCount++;
    this.game.tileRenderer.tilemap.emit(TilemapEvents.CELL_SELECTED, coord);
    // this.game.ui.emit(UIEvents.CELL_SELECTED, this.getCellEventData(coord));
    // TODO: emit Game UI event
  }

  public unselectCell(coord: Point) {
    this.selectedCells.set(coord.x, coord.y, 0);
    this.selectedCellCount--;
    this.game.tileRenderer.tilemap.emit(TilemapEvents.CELL_UNSELECTED, coord);
    // this.game.ui.emit(UIEvents.CELL_UNSELECTED, this.getCellEventData(coord));
    // TODO: emit Game UI event
  }

  public unselectAll() {
    for (let x = 0; x < this.size.width; x++) {
      for (let y = 0; y < this.size.width; y++) {
        const selected = this.selectedCells.get(x, y);
        if (selected === 1) {
          this.game.tileRenderer.tilemap.emit(TilemapEvents.CELL_UNSELECTED, { x, y });
          // this.game.ui.emit(UIEvents.CELL_UNSELECTED, this.getCellEventData(new Point(x, y)));
          // TODO: emit Game UI event
          this.selectedCells.set(x, y, 0);
        }
      }
    }
    this.selectedCellCount = 0;
  }

  public toggleCell(coord: Point) {
    if (this.isCellSelected(coord)) {
      this.unselectCell(coord);
    } else {
      this.selectCell(coord);
    }
  }

  public handleCellSelection(coord: Point) {
    if (this.selectedCellCount === 0) {
      this.selectCell(coord);
    } else {
      const shiftPressed = this.game.input.isPressed('shift');
      if (shiftPressed) {
        if (this.isCellSelected(coord)) {
          this.unselectCell(coord);
        } else {
          this.selectCell(coord);
        }
      } else {
        if (this.isCellSelected(coord)) {
          if (this.selectedCellCount > 1) {
            this.unselectAll();
            this.selectCell(coord);
          } else {
            this.unselectCell(coord);
          }
        } else {
          this.unselectAll();
          this.selectCell(coord);
        }
      }
    }
  }

  public setHoverCell(coord: Point | null) {
    this.game.tileRenderer.tilemap.emit(TilemapEvents.CELL_HOVER, coord, this.hoverCell);
    if (coord && (!this.hoverCell || !this.hoverCell.equals(coord))) {
      this.game.ui.emit(UIEvents.CELL_HOVERED, coord);
    }
    this.hoverCell = coord;
  }
}
/*

type GameGridCell = Set<Entity>;
export default class GameGrid extends EventEmitter<GameGridEvents> {
  public settings: GridSettings;
  public game: Game;
  public hoverCell: Point | null;

  private selectedCells: ndarray<number>;
  private selectedCellCount: number;

  private entities: Set<Entity>;
  private entityMap: ndarray<Set<Entity>>;

  constructor(settings: GridSettings, game: Game) {
    super();
    this.settings = settings;
    this.game = game;
    this.entities = new Set();

    this.entityMap = ndarray([], [settings.width, settings.height]);
    fill(this.entityMap, () => new Set());

    this.selectedCells = ndarray([], [settings.width, settings.height]);
    fill(this.selectedCells, () => 0);

    this.selectedCellCount = 0;
    this.hoverCell = null;

    this.game.input.on('esc', () => {
      console.log('unselect all cells');
      this.unselectAll();
    })

    const system = this.game.createSystem('gameGridSystem', [
      GridPositionAttribute
    ])
    console.log('GAME GRID SYSTEM');
    system.on('add', this.handleAddEntity.bind(this))
  }

  public isCellSelected(coord: Point): boolean {
    return this.selectedCells.get(coord.x, coord.y) === 1;
  }

  public selectCell(coord: Point) {
    this.selectedCells.set(coord.x, coord.y, 1);
    this.selectedCellCount++;
    this.game.tileRenderer.tilemap.emit(TilemapEvents.CELL_SELECTED, coord);
    this.game.ui.emit(UIEvents.CELL_SELECTED, this.getCellEventData(coord));
  }

  public unselectCell(coord: Point) {
    this.selectedCells.set(coord.x, coord.y, 0);
    this.selectedCellCount--;
    this.game.tileRenderer.tilemap.emit(TilemapEvents.CELL_UNSELECTED, coord);
    this.game.ui.emit(UIEvents.CELL_UNSELECTED, this.getCellEventData(coord));
  }

  public unselectAll() {
    for (let x = 0; x < this.settings.width; x++) {
      for (let y = 0; y < this.settings.width; y++) {
        const selected = this.selectedCells.get(x, y);
        if (selected === 1) {
          this.game.tileRenderer.tilemap.emit(TilemapEvents.CELL_UNSELECTED, { x, y });
          this.game.ui.emit(UIEvents.CELL_UNSELECTED, this.getCellEventData(new Point(x, y)));
          this.selectedCells.set(x, y, 0);
        }
      }
    }
    this.selectedCellCount = 0;
  }

  public toggleCell(coord: Point) {
    if (this.isCellSelected(coord)) {
      this.unselectCell(coord);
    } else {
      this.selectCell(coord);
    }
  }

  public handleCellSelection(coord: Point) {
    if (this.selectedCellCount === 0) {
      this.selectCell(coord);
    } else {
      const shiftPressed = this.game.input.isPressed('shift');
      if (shiftPressed) {
        if (this.isCellSelected(coord)) {
          this.unselectCell(coord);
        } else {
          this.selectCell(coord);
        }
      } else {
        if (this.isCellSelected(coord)) {
          if (this.selectedCellCount > 1) {
            this.unselectAll();
            this.selectCell(coord);
          } else {
            this.unselectCell(coord);
          }
        } else {
          this.unselectAll();
          this.selectCell(coord);
        }
      }
    }
  }

  public setHoverCell(coord: Point | null) {
    this.game.tileRenderer.tilemap.emit(TilemapEvents.CELL_HOVER, coord, this.hoverCell);
    if (coord && (!this.hoverCell || !this.hoverCell.equals(coord))) {
      this.game.ui.emit(UIEvents.CELL_HOVERED, coord);
    }
    this.hoverCell = coord;
  }

  private getCellEventData(coord: Point) {
    console.log(this.getCell(coord.x, coord.y));
    const entities = Array.from(this.getCell(coord.x, coord.y))
      .filter(entity => entity.hasAttributes(UIAttribute))
      .filter(entity => entity.attributes.get(UIAttribute).value.isVisible)
      .map(entity => ({
        id: entity.id,
        name: entity.attributes.get(UIAttribute).value.name
      }));
    console.log('entities', entities);
    return {
      coord,
      entities,
    };
  }

  private handleAddEntity(entity: Entity) {
    const valid = entity.hasAttributes(GridPositionAttribute);
    this.watchEntity(entity);
    // TODO: remove and unwatch
    entity.emit(GRID_POSITION_EVENTS.ADDED_TO_GRID, this);
    this.entities.add(entity);
  }

  public getCell(x: number, y: number): GameGridCell {
    return this.entityMap.get(x, y);
  }

  public isValid(x: number, y: number): boolean {
    return x > 0 && y > 0 && x < this.settings.width && y < this.settings.height;
  }

  private watchEntity(entity) {
    const gridPosition = entity.getAttribute(GridPositionAttribute);
    this.updateEntityLocation(entity, null, gridPosition.value);
    this.emit(GameGridEvents.CELL_CHANGED, gridPosition.value);
    gridPosition.subscribe(event => {
      this.updateEntityLocation(entity, event.oldValue, event.newValue);
      this.emit(GameGridEvents.CELL_CHANGED, event.oldValue);
      this.emit(GameGridEvents.CELL_CHANGED, event.newValue);
    });
  }

  private updateEntityLocation(entity: Entity, oldLocation: Coordinate | null, newLocation: Coordinate) {
    if (oldLocation) {
      const oldCell = this.getCell(oldLocation.x, oldLocation.y);
      oldCell.delete(entity);
    }
    const newCell = this.getCell(newLocation.x, newLocation.y);
    newCell.add(entity);
    if (oldLocation) {
      console.log(`Entity moved from ${oldLocation.x},${oldLocation.y} to ${newLocation.x},${newLocation.y}`);
    } else {
      console.log(`Entity moved to ${newLocation.x},${newLocation.y}`);
    }
  }
}

*/
