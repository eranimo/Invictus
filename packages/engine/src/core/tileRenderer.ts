import { Application, Container, settings, Sprite, Point, Texture } from 'pixi.js';
import Viewport from 'pixi-viewport';
import Game from './game';
import Tilemap from './tilemap';
import Tileset from './tileset';


/**
 * Contains Tilemap, all Tilesets, Viewport
 * Manages PIXI app
 * Handles Viewport events
 */
export default class TileRenderer {
  app: Application;
  viewport: Viewport;
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
    this.viewport = new Viewport({
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      worldHeight: 16 * 30,
      worldWidth: 16 * 30,
    });
    this.viewport
      .drag()
      // .on('clicked', this.handleClick.bind(this))
      .on('drag-end', () => {
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
