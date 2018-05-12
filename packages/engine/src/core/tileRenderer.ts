import Viewport from 'pixi-viewport';
import { Application, settings } from 'pixi.js';
import Game from './game';
import Tileset from './tileset';


/**
 * Contains Tilemap, all Tilesets, Viewport
 * Manages PIXI app
 * Handles Viewport events
 */
export default class TileRenderer {
  public app: Application;
  public viewport: Viewport;
  public game: Game;
  public tilesets: Map<string, Tileset>;
  public isDragging: boolean;

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
    this.viewport = new Viewport({
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      worldHeight: 16 * 30,
      worldWidth: 16 * 30,
    });
    this.isDragging = false;
    this.viewport
      .drag()
      // .on('clicked', this.handleClick.bind(this))
      .on('drag-start', () => this.isDragging = true)
      .on('drag-end', () => {
        this.isDragging = false;
        // snap to rounded pixels after panning
        this.viewport.moveCorner(
          Math.round(this.viewport.left),
          Math.round(this.viewport.top),
        );
      });
    this.app.stage.addChild(this.viewport);
    document.body.appendChild(this.app.view);
    this.tilesets = new Map();
  }

  public addTileset(name: string, tileset: Tileset) {
    this.tilesets.set(name, tileset);
  }

  public getTileset(name: string): Tileset {
    if (!this.tilesets.has(name)) {
      throw new Error(`TileRenderer does not have tileset named '${name}'`);
    }
    return this.tilesets.get(name);
  }
}
