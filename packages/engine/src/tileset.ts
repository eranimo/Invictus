import Node from './node';
import { loaders, Texture } from 'pixi.js';


export interface TileSetSettings {
  tileWidth: number;
  tileHeight: number;
}

export type TileRef = number | string;

export default class TileSet {
  resource: loaders.Resource;
  settings: TileSetSettings;
  
  private tilesByID: {
    [tileID: string]: Texture
  }

  private tilesByName: {
    [tileID: string]: Texture
  }

  constructor(resource: loaders.Resource, settings: TileSetSettings) {
    this.resource = resource;
    this.settings = settings;
    this.tilesByID = {};
    this.tilesByName = {};
  }

  getTile(ref: TileRef): Texture {
    if (typeof ref === 'number') {
      return this.tilesByID[ref];
    }
    if (typeof ref === 'string') {
      return this.tilesByName[ref];
    }
    return null;
  }

  createTile(tileID: number, name: string): Texture {
    const base = this.resource.texture.baseTexture
    const width = (base.width / this.settings.tileWidth);
    const height = (base.height / this.settings.tileHeight);
    const x = tileID % width;
    const y = Math.floor(tileID / width);
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
