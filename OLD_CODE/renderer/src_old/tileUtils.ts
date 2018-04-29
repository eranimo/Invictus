import * as PIXI from 'pixi.js';

interface Tile {
  x: number;
  y: number;
  z: number;
  bgColor: number;
  fgColor: number;
}

export interface TileOptions {
  bgColor?: number;
  fgColor: number
};
export type TileFactory = (options: TileOptions, cellSize: number) => PIXI.Texture;

export function createTileTexture(
  createForeground: (graphics: PIXI.Graphics, cellSize: number) => void,
  modifyTexture?: (texture: PIXI.Texture) => void
): TileFactory {
  return function tileFactory(
    options: TileOptions,
    cellSize: number
  ): PIXI.Texture {
    const graphics = new PIXI.Graphics();

    // draw background
    if (options.bgColor) {
      graphics.beginFill(options.bgColor, 1);
      graphics.drawRect(0, 0, cellSize, cellSize);
      graphics.endFill();
    }

    // draw foreground
    graphics.beginFill(options.fgColor, 1);
    createForeground(graphics, cellSize);
    graphics.endFill();
    const texture = graphics.generateCanvasTexture();
    if (modifyTexture) {
      modifyTexture(texture);
    }
    return texture;
  }
}
