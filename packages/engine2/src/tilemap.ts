import ndarray from 'ndarray';
import { Container, Sprite, Texture } from 'pixi.js';
import fill from 'ndarray-fill';
import { ColorReplaceFilter } from 'pixi-filters';

import Tileset from './tileset';
import Entity from './entity';
import GameGrid, { GAME_GRID_EVENTS } from './gameGrid';
import { TileAttribute } from './components/tile';
import TileRenderer from './tileRenderer';
import { GridPositionAttribute } from './components/grid';


interface TilemapOptions {
  width: number;
  height: number;
  tileWidth: number;
  tileHeight: number;
}

export default class Tilemap {
  public settings: TilemapOptions;

  private layerMap: ndarray<Sprite>;
  private tileset: Tileset;
  private tileContainer: Container;
  private tileRenderer: TileRenderer;

  constructor(
    settings: TilemapOptions,
    tileRenderer: TileRenderer,
  ) {
    this.settings = settings;
    this.layerMap = ndarray([], [settings.width, settings.height]);
    this.tileContainer = new Container()
    fill(this.layerMap, (x: number, y: number) => {
      const sprite = new Sprite();
      // sprite.interactive = true;
      // sprite.on('click', this.sendEventToEntities('click', x, y));
      sprite.x = this.settings.tileWidth * x;
      sprite.y = this.settings.tileHeight * y;
      return sprite;
    });

    tileRenderer.container.addChild(this.tileContainer);
    tileRenderer.container.x = 0;
    tileRenderer.container.y = 0;

    for (let x = 0; x < this.layerMap.shape[0]; x++) {
      for (let y = 0; y < this.layerMap.shape[1]; y++) {
        const sprite = this.layerMap.get(x, y);
        this.tileContainer.addChild(sprite);
      }
    }
    this.tileRenderer = tileRenderer;
    tileRenderer.game.gameGrid.on(GAME_GRID_EVENTS.CELL_CHANGED, this.updateTile.bind(this))
  }

  private updateTile(event) {
    const { x, y } = event;
    console.log(`Updating tile ${x}, ${y}`);
    const entities: Set<Entity> = this.tileRenderer.game.gameGrid.getCell(x, y);
    this.clearTile(x, y);
    entities.forEach((entity: Entity) => {
      const sprite = this.layerMap.get(x, y);
      const tile: TileAttribute = entity.getAttribute<TileAttribute>(TileAttribute);
      const tileset = this.tileRenderer.getTileset(tile.value.tileset);
      const tileTexture: Texture = tileset.getTile(tile.value.tileName);
      sprite.texture = tileTexture;
      sprite.filters = (tile as any).filters;
      sprite.rotation = tile.value.rotation * (Math.PI / 180)
    });
  }

  getEntitiesAtPoint(x: number, y: number): Set<Entity> {
    const cx = Math.floor(x / this.settings.tileWidth);
    const cy = Math.floor(y / this.settings.tileHeight);
    return this.tileRenderer.game.gameGrid.getCell(cx, cy);
  }

  private clearTile(x: number, y: number) {
    const sprite = this.layerMap.get(x, y);
    sprite.texture = PIXI.Texture.EMPTY;
    sprite.filters = [];
    sprite.rotation = 0;
  }
}
