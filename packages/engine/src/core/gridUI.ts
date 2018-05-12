import Scene from './scene';
import { Container, Point, Sprite, Texture } from 'pixi.js';
import fill from 'ndarray-fill';
import ndarray from 'ndarray';
import { makeGridTexture } from '@invictus/engine/utils/textures';
import KeyboardJS from 'keyboardjs';


/**
 * Handles:
 *  - hover cell
 *  - selected cells
 *  - grid lines
 */
interface IGridUISettings {
  width: number;
  height: number;
  tileWidth: number,
  tileHeight: number,
}
export class GridUI {
  scene: Scene;
  hoverCell: Point;
  private hoverSpriteMap: ndarray<Sprite>;
  gridLines: Sprite;
  gridLinesEnabled: boolean;

  constructor(scene: Scene, settings: IGridUISettings) {
    this.scene = scene;
    const gameGrid = scene.systemMap.GameGrid;

    this.hoverSpriteMap = ndarray([], [settings.width, settings.height]);
    this.hoverCell = null;

    const viewport = this.scene.game.tileRenderer.viewport;

    const container = new Container();
    container.interactive = true;
    container.cursor = 'default';
    container.on('mousemove', (event: PIXI.interaction.InteractionEvent) => {
      const coord: Point = viewport.toWorld(event.data.global.x, event.data.global.y);
      const cx = Math.floor(coord.x / settings.tileWidth);
      const cy = Math.floor(coord.y / settings.tileHeight);
      let hoverCell;
      if (gameGrid.isValid(cx, cy)) {
        hoverCell = new Point(cx, cy);
      } else {
        hoverCell = null;
      }
      this.handleCellHover(this.hoverCell, hoverCell);
      this.hoverCell = hoverCell;
    });
    container.on('click', (event: PIXI.interaction.InteractionEvent) => {
      console.log('click', event)
    });
    fill(this.hoverSpriteMap, (x: number, y: number) => {
      const hoverSprite = new Sprite(Texture.WHITE);
      hoverSprite.alpha = 0;
      hoverSprite.width = settings.tileWidth - 1;
      hoverSprite.height = settings.tileHeight - 1;
      hoverSprite.x = 1 + Math.round(settings.tileWidth * x);
      hoverSprite.y = 1 + Math.round(settings.tileHeight * y);
      container.addChild(hoverSprite);
      return hoverSprite;
    });

    this.gridLinesEnabled = true;
    this.gridLines = new Sprite(makeGridTexture(
      30 * 16,
      30 * 16,
      16,
      16,
      0xFFFFFF
    ));
    this.gridLines.alpha = this.gridLinesEnabled ? 0.1 : 0;
    viewport.addChild(this.gridLines);

    KeyboardJS.bind('g', event => {
      console.log('toggle grid visibility');
      if (this.gridLinesEnabled) {
        this.gridLines.alpha = 0;
        this.gridLinesEnabled = false;
      } else {
        this.gridLines.alpha = 0.1;
        this.gridLinesEnabled = true;
      }
    });

    viewport.addChild(container);
  }

  handleCellHover(oldHover: Point, newHover: Point) {
    let hoverSprite;
    if (oldHover) {
      hoverSprite = this.hoverSpriteMap.get(oldHover.x, oldHover.y);
      if (hoverSprite) {
        hoverSprite.alpha = 0;
      }
    }
    if (newHover) {
      hoverSprite = this.hoverSpriteMap.get(newHover.x, newHover.y);
      if (hoverSprite) {
        hoverSprite.alpha = 0.1;
      }
    }
  }
}
