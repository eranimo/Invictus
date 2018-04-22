import { Application, Container, settings } from 'pixi.js';
import Viewport from 'pixi-viewport';
import Game from './game';
import Tilemap from './tilemap';
import Tileset from './tileset';
import Entity from './entity';
import { GRID_INPUT_EVENTS } from '@invictus/engine/components/grid';


export default class TileRenderer {
  app: Application;
  container: Viewport;
  game: Game;
  tilesets: Map<string, Tileset>;
  tilemap: Tilemap;

  constructor(game: Game) {
    this.game = game;
    this.app = new Application(800, 600, {
      // backgroundColor: this.backgroundColor,
      width: window.innerWidth,
      height: window.innerHeight,
      resolution: window.devicePixelRatio,
      antialias: false,
      roundPixels: false,
    });
    settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
    this.container = new Viewport({
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      worldHeight: 16 * 30,
      worldWidth: 16 * 30,
    });
    this.container
      .drag()
      .on('clicked', this.handleInputEvent('click'));
    this.app.stage.addChild(this.container);
    document.body.appendChild(this.app.view);
    this.tilesets = new Map();

    this.tilemap = new Tilemap({
      width: 30,
      height: 30,
      tileWidth: 16,
      tileHeight: 16,
      layers: 2,
    }, this);
  }

  handleInputEvent(eventName) {
    return data => {
      console.log(data);
      const { x, y } = data.world;
      const entities: Set<Entity> = this.tilemap.getEntitiesAtPoint(x, y);
      entities.forEach(entity => entity.emit(GRID_INPUT_EVENTS.CELL_EVENT, 'click'));
    }
  }

  addTileset(name: string, tileset: Tileset) {
    this.tilesets.set(name, tileset);
  }

  getTileset(name: string): Tileset {
    if (!this.tilesets.has(name)) {
      throw new Error(`TileRenderer does not have tileset named '${name}'`);
    }
    return this.tilesets.get(name);
  }
}
