import ndarray from 'ndarray';
import { Point } from 'pixi.js';

import Entity from './entity';
import Scene from './scene';
import fill from 'ndarray-fill';
import EntityAttribute from './entityAttribute';
import { Coordinate } from './types';
import EventEmitter from '@invictus/engine/utils/eventEmitter';
import { GridPositionAttribute, GRID_POSITION_EVENTS } from '@invictus/engine/components/grid';
import Game from './game';
import { TilemapEvents } from '@invictus/engine/core/tilemap';


interface GridSettings {
  width: number;
  height: number;
};

export enum GameGridEvents {
  CELL_CHANGED
};

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
  }

  public isCellSelected(coord: Point): boolean {
    return this.selectedCells.get(coord.x, coord.y) === 1;
  }

  public selectCell(coord: Point) {
    this.selectedCells.set(coord.x, coord.y, 1);
    this.selectedCellCount++;
    this.game.tileRenderer.tilemap.emit(TilemapEvents.CELL_SELECTED, coord);
  }

  public unselectCell(coord: Point) {
    this.selectedCells.set(coord.x, coord.y, 0);
    this.selectedCellCount--;
    this.game.tileRenderer.tilemap.emit(TilemapEvents.CELL_UNSELECTED, coord);
  }

  public unselectAll() {
    for (let x = 0; x < this.settings.width; x++) {
      for (let y = 0; y < this.settings.width; y++) {
        const selected = this.selectedCells.get(x, y);
        if (selected === 1) {
          this.game.tileRenderer.tilemap.emit(TilemapEvents.CELL_UNSELECTED, { x, y });
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
      if (this.isCellSelected(coord)) {
        this.unselectCell(coord);
      } else {
        this.unselectAll();
        this.selectCell(coord);
      }
    }
  }

  public setHoverCell(coord: Point) {
    this.game.tileRenderer.tilemap.emit(TilemapEvents.CELL_HOVER, coord, this.hoverCell);
    this.hoverCell = coord;
  }

  public addEntity(entity: Entity) {
    const valid = entity.hasAttributes(GridPositionAttribute);
    this.watchEntity(entity);
    // TODO: remove and unwatch
    entity.emit(GRID_POSITION_EVENTS.ADDED_TO_GRID, this);
    this.entities.add(entity);
  }

  public getCell(x: number, y: number): GameGridCell {
    return this.entityMap.get(x, y);
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
