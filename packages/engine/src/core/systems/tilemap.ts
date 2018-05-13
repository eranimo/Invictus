import { GridPositionComponent, TileComponent } from '@invictus/engine/components';
import { Container, Sprite, Texture } from 'pixi.js';
import { ReactiveSystem } from '../system';
// import ndarray from 'ndarray';
// import fill from 'ndarray-fill';



export interface ITilemapSettings {
  width: number;
  height: number;
  tileWidth: number;
  tileHeight: number;
  layers: number;
}

export default class TilemapSystem extends ReactiveSystem {
  public static systemName = 'Tilemap';
  public static requiredComponents = ['GridPositionComponent', 'TileComponent'];

  public settings: ITilemapSettings;
  private layers: Container[];
  private tileContainer: Container;
  private entitySpriteMap: Map<number, Sprite>;

  public init(settings: ITilemapSettings) {
    this.settings = settings;
    const tileRenderer = this.game.tileRenderer;

    this.entitySpriteMap = new Map();

    // create sprite 2D arrays
    this.layers = [];

    // create tile container and listen to events
    this.tileContainer = new Container();
    tileRenderer.viewport.addChild(this.tileContainer);
    tileRenderer.viewport.x = 0;
    tileRenderer.viewport.y = 0;

    // create layers and sprites
    for (let i = 0; i < settings.layers; i++) {
      this.layers[i] = new Container();
      this.tileContainer.addChild(this.layers[i]);
    }
  }

  protected handleChanges(entityID: number, component: string, oldValue: any, newValue: any) {
    if (component === 'GridPositionComponent') {
      let sprite;
      if (newValue) {
        sprite = this.entitySpriteMap.get(entityID);
        if (!sprite) {}
        sprite.x = this.settings.tileWidth * newValue.x;
        sprite.y = this.settings.tileHeight * newValue.y;
      }
    } else if (component === 'TileComponent') {
      this.updateTile(entityID);
    }
  }

  protected onEntityAdded(entityID) {
    this.createTile(entityID);
    super.onEntityAdded(entityID);
  }

  private createTile(entityID) {
    const pos = this.manager.getComponent<GridPositionComponent>(entityID, 'GridPositionComponent');
    const tile = this.manager.getComponent<TileComponent>(entityID, 'TileComponent');
    const tileset = this.game.tileRenderer.getTileset(tile.value.tileset);
    const tileTexture: Texture = tileset.getTile(tile.value.tileName);
    const sprite = new Sprite();
    sprite.texture = tileTexture;
    sprite.filters = (tile as any).filters;
    sprite.rotation = tile.value.rotation * (Math.PI / 180);
    sprite.cacheAsBitmap = true;
    sprite.x = this.settings.tileWidth * pos.get('x');
    sprite.y = this.settings.tileHeight * pos.get('y');
    this.entitySpriteMap.set(entityID, sprite);
    this.layers[tile.get('layer')].addChild(sprite);
  }

  private updateTile(entityID) {
    const pos = this.manager.getComponent<GridPositionComponent>(entityID, 'GridPositionComponent');
    const tile = this.manager.getComponent<TileComponent>(entityID, 'TileComponent');
    const tileset = this.game.tileRenderer.getTileset(tile.value.tileset);
    const tileTexture: Texture = tileset.getTile(tile.value.tileName);
    const sprite = this.entitySpriteMap.get(entityID);
    sprite.texture = tileTexture;
    sprite.filters = (tile as any).filters;
    sprite.rotation = tile.value.rotation * (Math.PI / 180);
    sprite.cacheAsBitmap = true;
    sprite.x = this.settings.tileWidth * pos.get('x');
    sprite.y = this.settings.tileHeight * pos.get('y');
    this.entitySpriteMap.set(entityID, sprite);
  }

  // private updateTile(x: number, y: number) {
  //   const entities = this.systems.GameGrid.getCell(x, y);
  //   if (!entities) {
  //     return;
  //   }
  //   this.clearTile(x, y);
  //   for (const entityID of entities) {
  //     const tile = this.manager.getComponent<TileComponent>(entityID, 'TileComponent');
  //     const layers = this.layerMap.get(x, y);
  //     const sprite = layers[tile.value.layer];
  //     const tileset = this.game.tileRenderer.getTileset(tile.value.tileset);
  //     const tileTexture: Texture = tileset.getTile(tile.value.tileName);
  //     sprite.texture = tileTexture;
  //     sprite.filters = (tile as any).filters;
  //     sprite.rotation = tile.value.rotation * (Math.PI / 180);
  //   }
  // }

  // private clearTile(x: number, y: number) {
  //   const layers = this.layerMap.get(x, y);
  //   for (let i = 0; i < this.settings.layers; i++) {
  //     const sprite = layers[i];
  //     sprite.texture = PIXI.Texture.EMPTY;
  //     sprite.filters = [];
  //     sprite.rotation = 0;
  //   }
  // }

  // private createSprite(layer: number, x: number, y: number): Sprite {
  //   const sprite = new Sprite();
  //   // sprite.interactive = true;
  //   // sprite.on('mouseover', this.handleSpriteEvent('mouseover'));
  //   // sprite.on('mouseout', this.handleSpriteEvent('mouseout'));
  //   sprite.x = this.settings.tileWidth * x;
  //   sprite.y = this.settings.tileHeight * y;
  //   return sprite;
  // }
}
