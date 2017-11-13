import * as PIXI from 'pixi.js';
import * as TILES from './tiles';
import { ChunkData } from '@invictus/generator/mapGenerator';
import { TERRAIN_TYPES_ID_MAP, TERRAIN_TYPES } from '@invictus/generator/terrainTypes';
import * as ndarray from 'ndarray';


function anyWithinRange(
  array: ndarray,
  value: any,
  x: number,
  y: number,
  endW: number,
  endH: number
): boolean {
  for (let i = x; i < x + endW; i++) {
    for (let j = y; j < y + endH; j++) {
      if (array.get(i, j) === value) {
        return true;
      }
    }
  }
  return false;
}

let textureIDMap = {};

const riverTexture = TILES.tile_shade2({ fgColor: 0x0000FF }, 16)
const coastalTexture = TILES.tile_shade2({ fgColor: 0xEDC9AF }, 16)

function makeTextureIDMap(): { [id: number]: PIXI.Texture } {
  // make a texture based on each terrain type
  return TERRAIN_TYPES.map(terrainType => TILES.tile_shade1(terrainType.tileOptions, 16));
}

const WORLD_MAP_WIDTH = 100;
const WORLD_MAP_HEIGHT = 100;

export default class Renderer {
  app: PIXI.Application;
  mapContainer: PIXI.Container;
  worldMapContainer: PIXI.Container;
  textureIDMap: Object;
  worldMapCursor: PIXI.Sprite;

  constructor() {
    this.init();
  }

  init() {
    this.app = new PIXI.Application(800, 600, {
      backgroundColor: 0x111111,
      width: window.innerWidth / window.devicePixelRatio,
      height: window.innerHeight / window.devicePixelRatio,
      resolution: window.devicePixelRatio,
      antialias: false,
      roundPixels: true,
    });
    this.textureIDMap = makeTextureIDMap();
    document.body.appendChild(this.app.view);

    this.mapContainer = new PIXI.Container();
    this.mapContainer.x = 10;
    this.mapContainer.y = 120;
    this.mapContainer.scale = new PIXI.Point(0.5, 0.5);
    
    this.worldMapContainer = new PIXI.Container();
    this.worldMapContainer.x = 10;
    this.worldMapContainer.y = 10;
    this.app.stage.addChild(this.worldMapContainer);
    this.app.stage.addChild(this.mapContainer);
  }

  renderWorldMap(worldMapTerrain: ndarray, coastalCells: ndarray) {
    console.log(worldMapTerrain);
    const worldMap = new PIXI.Graphics();
    const width = worldMapTerrain.shape[0];
    const height = worldMapTerrain.shape[1];
    const strideW = width / WORLD_MAP_WIDTH;
    const strideH = height / WORLD_MAP_HEIGHT;

    // world map background
    for (let i = 0; i < width; i += strideW) {
      for (let j = 0; j < height; j += strideH) {
        const id = worldMapTerrain.get(i, j);
        const color = TERRAIN_TYPES[id].tileOptions.fgColor;
        worldMap.beginFill(color);
        const x = Math.round(i / strideH);
        const y = Math.round(j / strideW);
        worldMap.drawRect(x, y, 1, 1);
        worldMap.endFill();

        if (anyWithinRange(coastalCells, 1, i, j, strideW, strideH)) {
          worldMap.beginFill(0xEDC9AF);
          const x = Math.round(i / strideH);
          const y = Math.round(j / strideW);
          worldMap.drawRect(x, y, 1, 1);
          worldMap.endFill();
        }
      }
    }
    const worldMapTexture = worldMap.generateCanvasTexture();
    const worldMapSprite = new PIXI.Sprite(worldMapTexture);

    // world map cursor
    const worldMapCursorGraphics = new PIXI.Graphics();
    const cursorWidth = 10; //WORLD_MAP_WIDTH / 50;
    const cursorHeight = 10; //WORLD_MAP_HEIGHT / 50;
    worldMapCursorGraphics.lineStyle(1, 0xFFFFFF);
    worldMapCursorGraphics.drawRect(0.5, 0.5, 1.5, 1.5);
    const worldMapCursorTexture = worldMapCursorGraphics.generateCanvasTexture();
    this.worldMapCursor = new PIXI.Sprite(worldMapCursorTexture);

    this.worldMapContainer.addChild(worldMap);
    this.worldMapContainer.addChild(this.worldMapCursor);
  }

  changeWorldMapCursor(chunk: PIXI.Point) {
    this.worldMapCursor.x = chunk.x * (2);
    this.worldMapCursor.y = chunk.y * (2);
  }

  renderChunk(chunkData: ChunkData) {
    const CELL_SIZE = 16;
    this.mapContainer.removeChildren();

    // const textureIDs = Object.values(TILES)
    //   .map(factory => factory({ fgColor: 0x000000, bgColor: 0xC0C0C0 }, CELL_SIZE));

    for (let x = 0; x < chunkData.terrainTypesMap.shape[0]; x++) {
      for (let y = 0; y < chunkData.terrainTypesMap.shape[1]; y++) {
        const id = chunkData.terrainTypesMap.get(x, y);
        const isRiver = chunkData.riverMap.get(x, y);
        const isCoastal = chunkData.coastalCells.get(x, y);
        const texture = this.textureIDMap[id];
        if (texture) {
          const land = new PIXI.Sprite(texture);
          land.x = x * CELL_SIZE;
          land.y = y * CELL_SIZE;

          this.mapContainer.addChild(land);
        }
        if (isRiver) {
          const land = new PIXI.Sprite(riverTexture);
          land.x = x * CELL_SIZE;
          land.y = y * CELL_SIZE;

          this.mapContainer.addChild(land);
        }
        if (isCoastal) {
          const land = new PIXI.Sprite(coastalTexture);
          land.x = x * CELL_SIZE;
          land.y = y * CELL_SIZE;

          this.mapContainer.addChild(land);
        }
      }
    }
  }
}
