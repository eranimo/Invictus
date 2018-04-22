import { Graphics, Texture } from 'pixi.js';


export function makeSelectedCellTexture(width: number, height: number): Texture {
  const g = new Graphics();
  g.lineColor = 0xFFFFFF;
  g.lineWidth = 1;

  g.fillAlpha = 1;
  g.drawRect(0, 0, width, height);
  return g.generateCanvasTexture();
}

export function makeGridTexture(
  width: number,
  height: number,
  cellWidth: number,
  cellHeight: number,
  color = 0xFFFFFF
) {
  const g = new Graphics();
  g.lineColor = color;
  g.lineWidth = 1;
  for (let x = 0; x <= width; x += cellWidth) {
    g.moveTo(x, 0);
    g.lineTo(x, width);
    for (let y = 0; y <= height; y += cellHeight) {
      g.moveTo(0, y);
      g.lineTo(height, y);
    }
  }
  return g.generateCanvasTexture();
}
