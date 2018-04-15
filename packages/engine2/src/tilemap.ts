import ndarray from 'ndarray';
import { Container, Sprite, Texture } from 'pixi.js';
import Entity from './entity';
import fill from 'ndarray-fill';
import { TileAttribute, PositionAttribute } from './prefabs/tile';
import Tileset from './tileset';
import { ColorReplaceFilter } from 'pixi-filters';


interface TilemapOptions {
  width: number;
  height: number;
  tileset: Tileset;
}

export default class Tilemap {
  private settings: TilemapOptions;
  private entityMap: ndarray<Set<Entity>>;
  private layerMap: ndarray<Sprite>;
  private entities: Set<Entity>;
  tileset: Tileset;
  tilesetContainer: Container;

  constructor(settings: TilemapOptions) {
    this.settings = settings;
    this.entityMap = ndarray([], [settings.width, settings.height]);
    this.layerMap = ndarray([], [settings.width, settings.height]);
    fill(this.entityMap, () => new Set());
    this.tileset = settings.tileset;
    this.tilesetContainer = new Container()
    fill(this.layerMap, (x: number, y: number) => {
      const sprite = new Sprite();
      sprite.x = this.tileset.settings.tileWidth * x;
      sprite.y = this.tileset.settings.tileHeight * y;
      return sprite;
    });
    this.entities = new Set();
  }

  public attachTo(app) {
    app.container.addChild(this.tilesetContainer);
    // TODO: tilemap location
    app.container.x = 0;
    app.container.y = 0;
    for (let x = 0; x < this.layerMap.shape[0]; x++) {
      for (let y = 0; y < this.layerMap.shape[1]; y++) {
        const sprite = this.layerMap.get(x, y);
        this.tilesetContainer.addChild(sprite);
      }
    }
  }

  public addEntity(entity: Entity) {
    const valid = entity.hasAttributes(TileAttribute, PositionAttribute);
    if (!valid) {
      throw new Error('Tilemap can only store entities with a TileAttribute and PositionAttribute');
    }
    this.entities.add(entity);
    this.watchEntity(entity);
  }

  public hasEntity(entity: Entity) {
    return this.entities.has(entity);
  }

  private watchEntity(entity: Entity) {
    const position = this.getEntityPosition(entity);
    this.setEntityLocation(entity, position.value.x, position.value.y);
    entity.on('NEW_POSITION', newPosition => {
      this.setEntityLocation(entity, newPosition.x, newPosition.y);
    });
  }

  private getEntityPosition(entity: Entity): PositionAttribute {
    return entity.getAttribute(PositionAttribute);
  }

  private updateTile(x: number, y: number) {
    console.log(`Updating tile ${x}, ${y}`);
    const entities: Set<Entity> = this.getEntitiesAtLocation(x, y);
    this.clearTile(x, y);
    entities.forEach((entity: Entity) => {
      const sprite = this.layerMap.get(x, y);
      const tile: TileAttribute = entity.getAttribute<TileAttribute>(TileAttribute);
      const tileTexture: Texture = this.tileset.getTile(tile.value.tileName);
      sprite.texture = tileTexture;
      sprite.filters = (tile as any).filters;
      sprite.rotation = tile.value.rotation * (Math.PI / 180)
    });
  }

  private clearTile(x: number, y: number) {
    const sprite = this.layerMap.get(x, y);
    sprite.texture = PIXI.Texture.EMPTY;
    sprite.filters = [];
    sprite.rotation = 0;
  }

  /** Add an entity to the tilemap at a coordinate */
  private setEntityLocation(entity: Entity, x: number, y: number): void {
    if (this.locationHasEntity(entity, x, y)) {
      return;
    }
    const position = this.getEntityPosition(entity);
    let store = this.entityMap.get(position.value.x, position.value.y);
    if (store.has(entity)) {
      store.delete(entity);
      this.updateTile(position.value.x, position.value.y);
    }
    console.log(`Entity is now at ${x}, ${y}`);
    store = this.entityMap.get(x, y);
    store.add(entity);
    this.updateTile(x, y);
  }

  /** Check if an entity is at a location */
  private locationHasEntity(entity: Entity, x: number, y: number): boolean {
    const store = this.entityMap.get(x, y);
    return store.has(entity);
  }

  private getEntitiesAtLocation(x: number, y: number): Set<Entity> {
    return this.entityMap.get(x, y);
  }
}
