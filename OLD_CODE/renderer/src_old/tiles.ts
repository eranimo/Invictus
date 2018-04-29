import * as PIXI from 'pixi.js';
import { createTileTexture } from './tileUtils';

export const tile_solid = createTileTexture((g: PIXI.Graphics, cellSize: number) => {
  g.drawRect(0, 0, cellSize, cellSize);
});

export const tile_shade1 = createTileTexture((g: PIXI.Graphics, cellSize: number) => {
  for (let x = 0; x < cellSize; x++) {
    for (let y = 0; y < cellSize; y += 2) {
      if (x % 2 === 0) {
        g.drawRect(x, y, 1, 1);
      }
    }
    for (let y = 1; y <= cellSize - 1; y += 2) {
      if (x % 2 === 1) {
        g.drawRect(x, y, 1, 1);
      }
    }
  }
});

export const tile_shade2 = createTileTexture((g: PIXI.Graphics, cellSize: number) => {
  for (let x = 0; x < cellSize; x++) {
    for (let y = 0; y < cellSize; y += 4) {
      if (x % 2 === 0) {
        g.drawRect(x, y, 1, 1);
      }
    }

    for (let y = 2; y <= cellSize - 2; y += 4) {
      if (x % 2 === 1) {
        g.drawRect(x, y, 1, 1);
      }
    }
  }
});

export const tile_shade3 = createTileTexture((g: PIXI.Graphics, cellSize: number) => {
  for (let x = 0; x < cellSize; x += cellSize / 4) {
    for (let y = 0; y < cellSize; y += cellSize / 4) {
      g.drawRect(x, y, 1, 1);
    }
  }
  for (let x = cellSize / 8; x <= cellSize - 2; x += cellSize / 4) {
    for (let y = cellSize / 8; y <= cellSize - 2; y += cellSize / 4) {
      g.drawRect(x, y, 1, 1);
    }
  }
});

export const tile_shade4 = createTileTexture((g: PIXI.Graphics, cellSize: number) => {
  for (let x = 0; x < cellSize; x += cellSize / 4) {
    for (let y = 0; y < cellSize; y += cellSize / 4) {
      g.drawRect(x, y, 1, 1);
    }
  }
  for (let x = 2; x <= cellSize - 6; x += cellSize / 2) {
    for (let y = 2; y <= cellSize - 6; y += cellSize / 2) {
      g.drawRect(x, y, 1, 1);
    }
  }
  for (let x = 6; x <= cellSize - 2; x += cellSize / 2) {
    for (let y = 6; y <= cellSize - 2; y += cellSize / 2) {
      g.drawRect(x, y, 1, 1);
    }
  }
});

export const tile_shade5 = createTileTexture((g: PIXI.Graphics, cellSize: number) => {
  for (let x = 0; x < cellSize; x += cellSize / 2) {
    for (let y = 0; y < cellSize; y += cellSize / 4) {
      g.drawRect(x, y, 1, 1);
    }
  }
  for (let x = cellSize / 4; x <= cellSize - 4; x += cellSize / 2) {
    for (let y = (cellSize / 4) - 2; y <= cellSize; y += cellSize / 4) {
      g.drawRect(x, y, 1, 1);
    }
  }
});


export const tile_half_left = createTileTexture((g: PIXI.Graphics, cellSize: number) => {
  for (let x = 0; x < cellSize / 2; x++) {
    for (let y = 0; y < cellSize; y++) {
      g.drawRect(x, y, 1, 1);
    }
  }
});

export const tile_half_right = createTileTexture((g: PIXI.Graphics, cellSize: number) => {
  for (let x = cellSize / 2; x < cellSize; x++) {
    for (let y = 0; y < cellSize; y++) {
      g.drawRect(x, y, 1, 1);
    }
  }
});

export const tile_half_up = createTileTexture((g: PIXI.Graphics, cellSize: number) => {
  for (let x = 0; x < cellSize; x++) {
    for (let y = 0; y < cellSize / 2; y++) {
      g.drawRect(x, y, 1, 1);
    }
  }
});
export const tile_half_down = createTileTexture((g: PIXI.Graphics, cellSize: number) => {
  for (let x = 0; x < cellSize; x++) {
    for (let y = cellSize / 2; y < cellSize; y++) {
      g.drawRect(x, y, 1, 1);
    }
  }
});
