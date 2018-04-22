import ndarray from 'ndarray';
import { Container, Sprite, Texture, Point, Graphics } from 'pixi.js';
import fill from 'ndarray-fill';
import { ColorReplaceFilter } from 'pixi-filters';

import Tileset from './tileset';
import Entity from './entity';
import GameGrid, { GameGridEvents } from './gameGrid';
import { TileAttribute } from '@invictus/engine/components/tile';
import TileRenderer from '@invictus/engine/core/tileRenderer';
import { GridPositionAttribute } from '@invictus/engine/components/grid';
import { GRID_INPUT_EVENTS } from '@invictus/engine/components/grid';
import EventEmitter from '@invictus/engine/utils/eventEmitter';


interface TilemapOptions {
  width: number;
  height: number;
  tileWidth: number;
  tileHeight: number;
  layers: number;
}

export enum TilemapEvents {
  CELL_HOVER,
  CELL_SELECTED,
  CELL_UNSELECTED,
};

function makeSelectedCellTexture(width: number, height: number): Texture {
  const g = new Graphics()
  g.lineColor = 0xFFFFFF;
  g.lineWidth = 1;

  g.fillAlpha = 1;
  g.drawRect(0, 0, width, height);
  return g.generateCanvasTexture();
}

/**
 * Handles rendering of tiles, rendering of selected tiles, hovered tile
 */
export default class Tilemap extends EventEmitter<TilemapEvents> {
  public settings: TilemapOptions;

  private layerMap: ndarray<{
    [layerID: number]: Sprite
  }>;
  private hoverSpriteMap: ndarray<Sprite>;
  private selectedSpriteMap: ndarray<Sprite>;
  private tileset: Tileset;
  private tileContainer: Container;
  private tileRenderer: TileRenderer;

  constructor(
    settings: TilemapOptions,
    tileRenderer: TileRenderer,
  ) {
    super();
    this.settings = settings;
    this.tileRenderer = tileRenderer;

    // create sprite 2D arrays
    this.layerMap = ndarray([], [settings.width, settings.height]);
    this.hoverSpriteMap = ndarray([], [settings.width, settings.height]);
    this.selectedSpriteMap = ndarray([], [settings.width, settings.height]);

    // create tile container and listen to events
    this.tileContainer = new Container()
    this.tileContainer.interactive = true;
    this.tileContainer.on('mousemove', (event: PIXI.interaction.InteractionEvent) => {
      const coord: Point = this.tileRenderer.viewport.toWorld(event.data.global.x, event.data.global.y);
      const { x, y } = this.worldCoordToCell(coord);
      this.tileRenderer.game.gameGrid.setHoverCell(new Point(x, y));
    });
    tileRenderer.viewport.addChild(this.tileContainer);
    tileRenderer.viewport.x = 0;
    tileRenderer.viewport.y = 0;

    // create layers and sprites
    fill(this.layerMap, (x: number, y: number) => {
      let sprites = {};
      for (let i = 0; i < settings.layers; i++) {
        const sprite = this.createSprite(i, x, y);
        sprites[i] = sprite;
      }
      return sprites;
    });
    for (let x = 0; x < this.layerMap.shape[0]; x++) {
      for (let y = 0; y < this.layerMap.shape[1]; y++) {
        const layers = this.layerMap.get(x, y);
        Object.values(layers).forEach(sprite => {
          this.tileContainer.addChild(sprite);
        });
      }
    }

    const selectedCellTexture = makeSelectedCellTexture(
      this.settings.tileWidth,
      this.settings.tileHeight
    );
    fill(this.selectedSpriteMap, (x: number, y: number) => {
      const selectedSprite = new Sprite(selectedCellTexture);
      selectedSprite.alpha = 0;
      selectedSprite.width = this.settings.tileWidth;
      selectedSprite.height = this.settings.tileHeight;
      selectedSprite.x = this.settings.tileWidth * x;
      selectedSprite.y = this.settings.tileHeight * y;
      this.tileContainer.addChild(selectedSprite);
      return selectedSprite;
    });

    fill(this.hoverSpriteMap, (x: number, y: number) => {
      const hoverSprite = new Sprite(Texture.WHITE);
      hoverSprite.alpha = 0;
      hoverSprite.width = this.settings.tileWidth;
      hoverSprite.height = this.settings.tileHeight;
      hoverSprite.x = this.settings.tileWidth * x;
      hoverSprite.y = this.settings.tileHeight * y;
      this.tileContainer.addChild(hoverSprite);
      return hoverSprite;
    });

    // react to game grid events
    this.tileRenderer.game.gameGrid.on(GameGridEvents.CELL_CHANGED, this.updateTile.bind(this))

    // handle incomming tilemap events
    this.on(TilemapEvents.CELL_HOVER, this.handleCellHover.bind(this));
    this.on(TilemapEvents.CELL_SELECTED, this.handleCellSelected.bind(this));
    this.on(TilemapEvents.CELL_UNSELECTED, this.handleCellUnselected.bind(this));
  }

  private handleCellHover(newHover: Point, oldHover: Point) {
    let hoverSprite;
    if (oldHover) {
      hoverSprite = this.hoverSpriteMap.get(oldHover.x, oldHover.y);
      if (hoverSprite) {
        hoverSprite.alpha = 0;
      }
    }
    hoverSprite = this.hoverSpriteMap.get(newHover.x, newHover.y);
    if (hoverSprite) {
      hoverSprite.alpha = 0.1;
    }
  }

  private handleCellSelected(cell: Point) {
    const selectedSprite = this.selectedSpriteMap.get(cell.x, cell.y);
    if (selectedSprite) {
      selectedSprite.alpha = 1;
    }
  }

  private handleCellUnselected(cell: Point) {
    const selectedSprite = this.selectedSpriteMap.get(cell.x, cell.y);
    if (selectedSprite) {
      selectedSprite.alpha = 0;
    }
  }

  public handleTileEvent(eventName: string, coordinate: Point) {
    const entities: Set<Entity> = this.getEntitiesAtPoint(coordinate);
    entities.forEach(entity => entity.emit(GRID_INPUT_EVENTS.CELL_EVENT, eventName));
  }

  private createSprite(layer: number, x: number, y: number): Sprite {
    const sprite = new Sprite();
    sprite.interactive = true;
    sprite.on('mouseover', this.handleSpriteEvent('mouseover'));
    sprite.on('mouseout', this.handleSpriteEvent('mouseout'));
    sprite.x = this.settings.tileWidth * x;
    sprite.y = this.settings.tileHeight * y;
    return sprite;
  }

  private handleSpriteEvent(eventName: string) {
    return (event: PIXI.interaction.InteractionEvent) => {
      const coord: Point = this.tileRenderer.viewport.toWorld(event.data.global.x, event.data.global.y);
      this.handleTileEvent('mouseover', coord);
    }
  }

  private updateTile(event) {
    const { x, y } = event;
    console.log(`Updating tile ${x}, ${y}`);
    const entities: Set<Entity> = this.tileRenderer.game.gameGrid.getCell(x, y);
    this.clearTile(x, y);
    entities.forEach((entity: Entity) => {
      const tile: TileAttribute = entity.getAttribute<TileAttribute>(TileAttribute);
      const layers = this.layerMap.get(x, y);
      const sprite = layers[tile.value.layer];
      const tileset = this.tileRenderer.getTileset(tile.value.tileset);
      const tileTexture: Texture = tileset.getTile(tile.value.tileName);
      sprite.texture = tileTexture;
      sprite.filters = (tile as any).filters;
      sprite.rotation = tile.value.rotation * (Math.PI / 180)
    });
  }

  getEntitiesAtPoint(coord: Point): Set<Entity> {
    const { x, y } = this.worldCoordToCell(coord);
    return this.tileRenderer.game.gameGrid.getCell(x, y);
  }

  worldCoordToCell(coord: Point) {
    return new Point(
      Math.floor(coord.x / this.settings.tileWidth),
      Math.floor(coord.y / this.settings.tileHeight),
    );
  }

  private clearTile(x: number, y: number) {
    const layers = this.layerMap.get(x, y);
    for (let i = 0; i < this.settings.layers; i++) {
      const sprite = layers[i];
      sprite.texture = PIXI.Texture.EMPTY;
      sprite.filters = [];
      sprite.rotation = 0;
    }
  }
}
