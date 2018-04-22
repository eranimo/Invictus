import ndarray from 'ndarray';
import Entity from './entity';
import Scene from './scene';
import fill from 'ndarray-fill';
import EntityAttribute from './entityAttribute';
import { Coordinate } from './types';
import EventEmitter from '@invictus/engine/utils/eventEmitter';
import { GridPositionAttribute, GRID_POSITION_EVENTS } from '@invictus/engine/components/grid';
import Game from './game';


interface GridSettings {
  width: number;
  height: number;
};

export const GAME_GRID_EVENTS = {
  CELL_CHANGED: 'CELL_CHANGED',
};

type GameGridCell = Set<Entity>;
export default class GameGrid extends EventEmitter {
  private entities: Set<Entity>;
  settings: GridSettings;
  private entityMap: ndarray<Set<Entity>>;
  game: Game;

  constructor(settings: GridSettings, game: Game) {
    super();
    this.settings = settings;
    this.game = game;
    this.entities = new Set();
    this.entityMap = ndarray([], [settings.width, settings.height]);
    fill(this.entityMap, () => new Set());
  }

  public addEntity(entity: Entity) {
    const valid = entity.hasAttributes(GridPositionAttribute);
    this.watchEntity(entity);
    // TODO: remove and unwatch
    entity.emit(GRID_POSITION_EVENTS.ADDED_TO_GRID, this);
    this.entities.add(entity);
  }

  private watchEntity(entity) {
    const gridPosition = entity.getAttribute(GridPositionAttribute);
    this.updateEntityLocation(entity, null, gridPosition.value);
    this.emit(GAME_GRID_EVENTS.CELL_CHANGED, gridPosition.value);
    gridPosition.subscribe(event => {
      this.updateEntityLocation(entity, event.oldValue, event.newValue);
      this.emit(GAME_GRID_EVENTS.CELL_CHANGED, event.oldValue);
      this.emit(GAME_GRID_EVENTS.CELL_CHANGED, event.newValue);
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

  public getCell(x: number, y: number): GameGridCell {
    return this.entityMap.get(x, y);
  }
}
