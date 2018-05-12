import { Application, Container, settings, Sprite } from 'pixi.js';
import Viewport from 'pixi-viewport';
import Game from './game';
import Tilemap from './tilemap';
import Tileset from './tileset';
import { makeGridTexture } from '@invictus/engine/utils/textures';
import KeyboardJS from 'keyboardjs';


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
  grid: Sprite;
  gridEnabled: boolean;

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
      .on('clicked', this.handleClick.bind(this))
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

    this.tilemap = new Tilemap({
      width: 30,
      height: 30,
      tileWidth: 16,
      tileHeight: 16,
      layers: 2,
    }, this);

    this.gridEnabled = true;
    this.grid = new Sprite(makeGridTexture(
      30 * 16,
      30 * 16,
      16,
      16,
      0xFFFFFF
    ));
    this.grid.alpha = this.gridEnabled ? 0.1 : 0;
    this.viewport.addChild(this.grid);

    KeyboardJS.bind('g', event => {
      console.log('toggle grid visibility');
      if (this.gridEnabled) {
        this.grid.alpha = 0;
        this.gridEnabled = false;
      } else {
        this.grid.alpha = 0.1;
        this.gridEnabled = true;
      }
    });
  }

  handleClick(data) {
    this.tilemap.handleTileEvent('click', data.world);
    const cell = this.tilemap.worldCoordToCell(data.world);
    this.game.gameGrid.handleCellSelection(cell);
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
