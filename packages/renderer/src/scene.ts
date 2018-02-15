import * as PIXI from 'pixi.js';
import { MultiColorReplaceFilter, ColorReplaceFilter } from 'pixi-filters';

const CELL_WIDTH = 50;
const CELL_HEIGHT = 50;
const CELL_SIZE = 10;


function createTileTexture(
  resource: PIXI.loaders.Resource,
  tileSize: number,
  tileID: number
): PIXI.Texture {
  const base = resource.texture.baseTexture
  const width = (base.width / tileSize);
  const height = (base.height / tileSize);
  const x = tileID % width;
  const y = Math.floor(tileID / width);
  const texture = new PIXI.Texture(base);
  texture.frame = new PIXI.Rectangle(
    x * tileSize,
    y * tileSize,
    tileSize,
    tileSize,
  );

  return texture;
}

class TileMap {
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


export default class SceneRenderer {
  app: PIXI.Application;
  loaded: boolean;
  resources: any;

  constructor() {
    this.app = new PIXI.Application(800, 600, {
      backgroundColor: 0x111111,
      width: CELL_WIDTH * CELL_SIZE,
      height: CELL_HEIGHT * CELL_SIZE,
      resolution: window.devicePixelRatio,
      antialias: false,
      roundPixels: false,
    });
    PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
    document.body.appendChild(this.app.view);
    const retroFont = require('./images/tilemap.png');
    PIXI.loader.add('retro', retroFont);
    PIXI.loader.load(this.onLoad.bind(this));
  }

  onLoad(loader, resources) {
    console.log(resources.retro);
    this.resources = resources;
    this.render();
  }

  render() {
    const container = new PIXI.Container();
    container.x = 0;
    container.y = 0;
    const scale = 1 / window.devicePixelRatio;
    container.scale = new PIXI.Point(scale, scale);

    const TILE_MOB = createTileTexture(this.resources.retro, 16, 32);
    const TILE_DOTS_TWO = createTileTexture(this.resources.retro, 16, 37);

    const tilemap = new TileMap(this.app, CELL_WIDTH, CELL_HEIGHT, CELL_SIZE);
    tilemap.setTileTexture(5, 5, TILE_MOB);
    tilemap.setTileTexture(5, 10, TILE_DOTS_TWO);
    tilemap.setTileRotation(5, 10, 90);
    tilemap.setTileColorReplacements(5, 5, [
      [[0, 0, 0], [39 / 255, 166 / 255, 188 / 255]],
      [[1, 0, 0], [0, 0, 0, 0]],
    ])

    const tilemapContainer = tilemap.render();
    tilemapContainer.scale = new PIXI.Point(1, 1);
    this.app.stage.addChild(tilemapContainer);
    this.app.stage.addChild(container);
  }
}

