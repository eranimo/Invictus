import Scene from './scene';
import { Container, Point, Sprite, Texture } from 'pixi.js';
import fill from 'ndarray-fill';
import ndarray from 'ndarray';
import { makeGridTexture } from '@invictus/engine/utils/textures';
import KeyboardJS from 'keyboardjs';
import { makeSelectedCellTexture } from '@invictus/engine/utils/textures';
import { UIEvents } from './game';

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
  settings: IGridUISettings;

  private hoverCell: Point;
  private hoverSpriteMap: ndarray<Sprite>;
  private gridLines: Sprite;
  private gridLinesEnabled: boolean;
  private selectedSpriteMap: ndarray<Sprite>;
  private selectedCells: ndarray<number>;
  private selectedCellCount: number;

  constructor(scene: Scene, settings: IGridUISettings) {
    this.scene = scene;
    this.settings = settings;

    this.hoverSpriteMap = ndarray([], [settings.width, settings.height]);
    this.selectedSpriteMap = ndarray([], [settings.width, settings.height]);
    this.hoverCell = null;

    const viewport = this.scene.game.tileRenderer.viewport;

    const container = new Container();
    container.interactive = true;
    container.cursor = 'default';
    container.on('mousemove', this.handleMouseMove);
    container.on('click', this.handleClick);
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

    this.selectedCells = ndarray([], [settings.width, settings.height]);
    fill(this.selectedCells, () => 0);

    const selectedCellTexture = makeSelectedCellTexture(
      this.settings.tileWidth,
      this.settings.tileHeight
    );
    fill(this.selectedSpriteMap, (x: number, y: number) => {
      const selectedSprite = new Sprite(selectedCellTexture);
      selectedSprite.alpha = 0;
      selectedSprite.width = this.settings.tileWidth;
      selectedSprite.height = this.settings.tileHeight;
      selectedSprite.x = Math.round(this.settings.tileWidth * x);
      selectedSprite.y = Math.round(this.settings.tileHeight * y);
      container.addChild(selectedSprite);
      return selectedSprite;
    });

    this.selectedCellCount = 0;

    this.scene.game.input.on('esc', () => {
      console.log('unselect all cells');
      this.unselectAll();
    });

    viewport.addChild(container);
  }

  handleMouseMove = (event: PIXI.interaction.InteractionEvent) => {
    const cell = this.getCellFromScreen(event);
    const hoverCell = this.isCellValid(cell) ? cell : null;
    this.handleCellHover(this.hoverCell, hoverCell);
    this.hoverCell = hoverCell;
    if (hoverCell) {
      this.scene.game.ui.emit(UIEvents.CELL_HOVERED, hoverCell);
    }
  };

  handleClick = (event: PIXI.interaction.InteractionEvent) => {
    if (!this.scene.game.tileRenderer.isDragging) {
      const cell = this.getCellFromScreen(event);
      this.handleCellSelection(cell);
    }
  };

  isCellValid(cell: Point): boolean {
    return cell.x > 0 && cell.y > 0 && cell.x < this.settings.width && cell.y < this.settings.height;
  }

  getCellFromScreen(event: PIXI.interaction.InteractionEvent) {
    const viewport = this.scene.game.tileRenderer.viewport;
    const coord: Point = viewport.toWorld(event.data.global.x, event.data.global.y);
    const cx = Math.floor(coord.x / this.settings.tileWidth);
    const cy = Math.floor(coord.y / this.settings.tileHeight);
    return new Point(cx, cy);
  }

  private handleCellHover(oldHover: Point, newHover: Point) {
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

  public isCellSelected(coord: Point): boolean {
    return this.selectedCells.get(coord.x, coord.y) === 1;
  }

  public selectCell(cell: Point) {
    this.selectedCells.set(cell.x, cell.y, 1);
    this.selectedCellCount++;
    const selectedSprite = this.selectedSpriteMap.get(cell.x, cell.y);
    if (selectedSprite) {
      selectedSprite.alpha = 1;
    }
    this.scene.game.ui.emit(UIEvents.CELL_SELECTED, this.getCellEventData(cell));
  }

  public unselectCell(cell: Point) {
    this.selectedCells.set(cell.x, cell.y, 0);
    this.selectedCellCount--;
    const selectedSprite = this.selectedSpriteMap.get(cell.x, cell.y);
    if (selectedSprite) {
      selectedSprite.alpha = 0;
    }
    this.scene.game.ui.emit(UIEvents.CELL_UNSELECTED, this.getCellEventData(cell));
  }

  public unselectAll() {
    for (let x = 0; x < this.settings.width; x++) {
      for (let y = 0; y < this.settings.width; y++) {
        const selected = this.selectedCells.get(x, y);
        if (selected === 1) {
          this.unselectCell(new Point(x, y));
        }
      }
    }
    this.selectedCellCount = 0;
  }

  public toggleCell(coord: Point) {
    if (this.isCellSelected(coord)) {
      this.unselectCell(coord);
    } else {
      this.selectCell(coord);
    }
  }

  public handleCellSelection(cell: Point) {
    console.log('selection:', cell);
    if (this.selectedCellCount === 0) {
      this.selectCell(cell);
    } else {
      const shiftPressed = this.scene.game.input.isPressed('shift');
      if (shiftPressed) {
        if (this.isCellSelected(cell)) {
          this.unselectCell(cell);
        } else {
          this.selectCell(cell);
        }
      } else {
        if (this.isCellSelected(cell)) {
          if (this.selectedCellCount > 1) {
            this.unselectAll();
            this.selectCell(cell);
          } else {
            this.unselectCell(cell);
          }
        } else {
          this.unselectAll();
          this.selectCell(cell);
        }
      }
    }
  }

  private getCellEventData(coord: Point) {
    const gameGrid = this.scene.systemMap.GameGrid;
    const manager = this.scene.entityManager;
    console.log(gameGrid.getCell(coord.x, coord.y));
    const entities = Array.from(gameGrid.getCell(coord.x, coord.y))
      .filter((entityID: number) => manager.hasComponent(entityID, 'UIComponent'))
      .filter((entityID: number) => (
        manager.getComponent(entityID, 'UIComponent').get('isVisible') === true
      ))
      .map((entityID: number) => ({
        id: entityID,
        name: manager.getComponent(entityID, 'UIComponent').get('name'),
      }));
    console.log('entities', entities);
    return {
      coord,
      entities,
    };
  }
}
