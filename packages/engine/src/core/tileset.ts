import { loaders, Texture } from 'pixi.js';

export interface ITileSetSettings {
  tileWidth: number;
  tileHeight: number;
  tiles: {
    [tileName: string]: {
      index: number,
    },
  };
}

export type TileRef = number | string;

export default class Tileset {
  public resource: loaders.Resource;
  public settings: ITileSetSettings;

  private tilesByID: {
    [tileID: string]: Texture,
  };

  private tilesByName: {
    [tileID: string]: Texture,
  };

  constructor(resource: loaders.Resource, settings: ITileSetSettings) {
    this.resource = resource;
    this.settings = settings;
    this.tilesByID = {};
    this.tilesByName = {};

    for (const [tileName, tileDef] of Object.entries(settings.tiles)) {
      this.createTile(tileDef.index, tileName);
    }
  }

  public getTile(ref: TileRef): Texture {
    if (typeof ref === 'number') {
      return this.tilesByID[ref];
    }
    if (typeof ref === 'string') {
      return this.tilesByName[ref];
    }
    return null;
  }

  public createTile(tileID: number, name: string): Texture {
    const base = this.resource.texture.baseTexture;
    const width = (base.width / this.settings.tileWidth);
    const height = (base.height / this.settings.tileHeight);
    const x = tileID % width;
    const y = Math.floor(tileID / height);
    const texture = new PIXI.Texture(base);
    texture.frame = new PIXI.Rectangle(
      x * this.settings.tileWidth,
      y * this.settings.tileHeight,
      this.settings.tileWidth,
      this.settings.tileHeight,
    );
    this.tilesByID[tileID] = texture;
    this.tilesByName[name] = texture;
    return texture;
  }
}
