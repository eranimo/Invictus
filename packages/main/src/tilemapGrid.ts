import { MultiColorReplaceFilter, ColorReplaceFilter } from 'pixi-filters';


export default class TileMapGrid {
  public app: PIXI.Application;
  public width: number;
  public height: number;
  public cellSize: number;

  private container: PIXI.Container;
  private spriteMap: {
    [tileID: number]: PIXI.Sprite
  };

  constructor(app: PIXI.Application, width: number, height: number, cellSize: number) {
    this.app = app;
    this.width = width;
    this.height = height;
    this.cellSize = cellSize;
    this.init();
  }

  private init() {
    this.spriteMap = {};
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        const tileID = this.getTileID(x, y);
        this.spriteMap[tileID] = new PIXI.Sprite();
        this.spriteMap[tileID].x = this.cellSize * x;
        this.spriteMap[tileID].y = this.cellSize * y;
      }
    }
  }

  private getTileID(x: number, y: number) {
    return x + (y * this.width);
  }

  public setTileTexture(x: number, y: number, texture: PIXI.Texture): void {
    const tileID = this.getTileID(x, y);
    this.spriteMap[tileID].texture = texture;
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

  public render(): PIXI.Container {
    this.container = new PIXI.Container();
    for (const sprite of Object.values(this.spriteMap)) {
      this.container.addChild(sprite);
    }
    return this.container;
  }
}
