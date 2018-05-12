import ndarray from 'ndarray';
import { Container, Sprite, Texture, Point, Graphics } from 'pixi.js';
import fill from 'ndarray-fill';

import { ReactiveSystem } from '../system';
import Tileset from '../tileset';
import { TileComponent, GridPositionComponent } from '@invictus/engine/components';



export interface ITilemapSettings {
  width: number;
  height: number;
  tileWidth: number;
  tileHeight: number;
  layers: number;
}

export default class TilemapSystem extends ReactiveSystem {
  static systemName = 'Tilemap';
  static requiredComponents = ['GridPositionComponent', 'TileComponent'];

  public settings: ITilemapSettings;
  private layerMap: ndarray<{
    [layerID: number]: Sprite
  }>;
  private tileset: Tileset;
  private tileContainer: Container;

  init(settings: ITilemapSettings) {
    this.settings = settings;
    const tileRenderer = this.game.tileRenderer;

    // create sprite 2D arrays
    this.layerMap = ndarray([], [settings.width, settings.height]);

    // create tile container and listen to events
    this.tileContainer = new Container()
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
  }

  protected handleChanges(entityID: number, component: string, oldValue: any, newValue: any) {
    console.log('Tilemap', entityID, component, oldValue, newValue);
    if (component === 'GridPositionComponent') {
      if (oldValue) {
        this.updateTile(oldValue.x, oldValue.y);
      }
      if (newValue) {
        this.updateTile(newValue.x, newValue.y);
      }
    } else if (component === 'TileComponent') {

    }
  }

  private updateTile(x: number, y: number) {
    console.log(`Updating tile ${x}, ${y}`);
    const entities = this.systems.GameGrid.getCell(x, y);
    if (!entities) {
      return;
    }
    this.clearTile(x, y);
    for (const entityID of entities) {
      const tile = this.manager.getComponent<TileComponent>(entityID, 'TileComponent');
      const layers = this.layerMap.get(x, y);
      const sprite = layers[tile.value.layer];
      const tileset = this.game.tileRenderer.getTileset(tile.value.tileset);
      const tileTexture: Texture = tileset.getTile(tile.value.tileName);
      sprite.texture = tileTexture;
      sprite.filters = (tile as any).filters;
      sprite.rotation = tile.value.rotation * (Math.PI / 180)
    }
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

  private createSprite(layer: number, x: number, y: number): Sprite {
    const sprite = new Sprite();
    sprite.interactive = true;
    // sprite.on('mouseover', this.handleSpriteEvent('mouseover'));
    // sprite.on('mouseout', this.handleSpriteEvent('mouseout'));
    sprite.x = this.settings.tileWidth * x;
    sprite.y = this.settings.tileHeight * y;
    return sprite;
  }
}
