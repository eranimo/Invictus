import { MultiColorReplaceFilter, ColorReplaceFilter } from 'pixi-filters';
import Node2D, { Node2DProps } from './node2D';
import Preloader from './preloader';
import TileSet, { TileRef } from './tileset';
import { Container, Sprite, Texture } from 'pixi.js';
import Vector2D from 'victor';


export interface TilemapProps extends Node2DProps {
  width: number;
  height: number;
  cellSize: number;
  tileset: {
    location: string,
    resource: string,
  },
}

export default class Tilemap<T extends TilemapProps> extends Node2D<T> {
  private tilesetContainer: Container;
  private spriteMap: {
    [tileID: number]: Sprite
  };

  async init() {
    console.log('tilemap init');
    const { width, height, cellSize } = this.props;
    this.spriteMap = {};
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const tileID = this.getTileID(new Vector2D(x, y));
        this.spriteMap[tileID] = new PIXI.Sprite();
        this.spriteMap[tileID].x = cellSize * x;
        this.spriteMap[tileID].y = cellSize * y;
      }
    }
  }

  get tileset() {
    const { location, resource } = this.props.tileset;
    const node = this.getNode(location);
    console.log('found', node.resources, resource);
    return node.resources[resource];
  }

  private getTileID(position: Vector2D) {
    return position.x + (position.y * (this.props.width as number));
  }

  public clearTile(position: Vector2D) {
    const tileID = this.getTileID(position);
    this.spriteMap[tileID].texture = PIXI.Texture.EMPTY;
    this.spriteMap[tileID].filters = [];
  }

  public setTileColorReplacements(position: Vector2D, colorMap) {
    const tileID = this.getTileID(position);
    const filters = [];
    for (const color of colorMap) {
      const before = color[0].map(c => c / 255);
      const after = color[1].map(c => c / 255);
      const filter = new ColorReplaceFilter(before, after, .1);
      filter.resolution = window.devicePixelRatio;
      filters.push(filter);
    }
    this.spriteMap[tileID].filters = filters;
  }

  public setTileRotation(position: Vector2D, rotation: number) {
    const tileID = this.getTileID(position);
    this.spriteMap[tileID].rotation = rotation * (Math.PI / 180);
  }

  onEnterTree() {
    const viewport = this.getNode('/root');
    this.tilesetContainer = new Container();
    viewport.container.addChild(this.tilesetContainer);
    viewport.container.x = this.props.position.x;
    viewport.container.y = this.props.position.y;
    for (const sprite of Object.values(this.spriteMap)) {
      this.tilesetContainer.addChild(sprite);
    }
  }
  
  setCell(position: Vector2D, tileRef: TileRef) {
    const tileTexture: Texture = this.tileset.getTile(tileRef);
    const tileID = this.getTileID(position);
    if (this.spriteMap[tileID]) {
      this.spriteMap[tileID].texture = tileTexture;
    }
  }
}
