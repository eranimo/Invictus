import { MultiColorReplaceFilter, ColorReplaceFilter } from 'pixi-filters';
import Node2D, { Node2DProps } from './node2D';
import Preloader from './preloader';
import TileSet, { TileRef } from './tileset';
import { Container, Sprite, Texture } from 'pixi.js';


export interface TilemapProps extends Node2DProps {
  width: number;
  height: number;
  cellSize: number;
}

export default class Tilemap<T extends TilemapProps> extends Node2D<T> {
  public tileset: TileSet;
  private tilesetContainer: Container;
  private spriteMap: {
    [tileID: number]: Sprite
  };

  init() {
    const { width, height, cellSize } = this.props;
    this.spriteMap = {};
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        const tileID = this.getTileID(x, y);
        this.spriteMap[tileID] = new PIXI.Sprite();
        this.spriteMap[tileID].x = cellSize * x;
        this.spriteMap[tileID].y = cellSize * y;
      }
    }
  }
  private getTileID(x: number, y: number) {
    return x + (y * (this.props.width as number));
  }

  public clearTile(x: number, y: number) {
    const tileID = this.getTileID(x, y);
    this.spriteMap[tileID].texture = PIXI.Texture.EMPTY;
  }

  public setTileColorReplacements(x: number, y: number, colorMap) {
    const tileID = this.getTileID(x, y);
    const filters = [];
    for (const color of colorMap) {
      console.log(color);
      const filter = new ColorReplaceFilter(color[0], color[1], .1);
      filter.resolution = window.devicePixelRatio;
      filters.push(filter);
    }
    this.spriteMap[tileID].filters = filters;
  }

  public setTileRotation(x: number, y: number, rotation: number) {
    const tileID = this.getTileID(x, y);
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
  
  setCell(x: number, y: number, tileRef: TileRef) {
    const tileTexture: Texture = this.tileset.getTile(tileRef);
    const tileID = this.getTileID(x, y);
    this.spriteMap[tileID].texture = tileTexture;
    console.log('setCell', tileTexture);
  }
}
