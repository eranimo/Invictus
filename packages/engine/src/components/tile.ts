import { Component } from '@invictus/engine/game';


export interface TileData {
  tilemapName: string;
  tileID: number;
  rotation: number;
  colorReplacements: [number, number, number][][];
}

const Tile: Component<TileData> = {
  factory(): TileData {
    return {
      tilemapName: null,
      tileID: null,
      rotation: null,
      colorReplacements: null,
    };
  },
  reset(tile: TileData) {
    tile.tilemapName = null;
    tile.tileID = null;
    tile.rotation = null;
    tile.colorReplacements = null;
  },
};

export default Tile;
