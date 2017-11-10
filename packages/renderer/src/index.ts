import * as PIXI from 'pixi.js';
import * as TILES from './tiles';
import { ChunkData } from '@invictus/generator/mapGenerator';
import { TERRAIN_TYPES_ID_MAP, TERRAIN_TYPES } from '@invictus/generator/terrainTypes';
import * as ndarray from 'ndarray';


let textureIDMap = {};

function makeTextureIDMap(): { [id: number]: PIXI.Texture } {
  // make a texture based on each terrain type
  return TERRAIN_TYPES.map(terrainType => TILES.tile_shade2(terrainType.tileOptions, 16));
}

export default class Renderer {
  app: PIXI.Application;
  mapContainer: PIXI.Container;
  worldMapContainer: PIXI.Container;
  textureIDMap: Object;

  constructor() {
    this.init();
  }

  init() {
    this.app = new PIXI.Application(800, 600, {
      backgroundColor: 0x111111,
      width: window.innerWidth / window.devicePixelRatio,
      height: window.innerHeight / window.devicePixelRatio,
      resolution: window.devicePixelRatio,
    });
    this.textureIDMap = makeTextureIDMap();
    document.body.appendChild(this.app.view);

    this.mapContainer = new PIXI.Container();
    this.mapContainer.y = 100;
    this.worldMapContainer = new PIXI.Container();
    this.mapContainer.scale = new PIXI.Point(0.5, 0.5);
  }

  renderWorldMap(worldMapTerrain: ndarray) {
    console.log(worldMapTerrain);
    const worldMap = new PIXI.Graphics();
    const mapWidth = 100;
    const mapHeight = 100;
    const width = worldMapTerrain.shape[0];
    const height = worldMapTerrain.shape[1];
    const strideW = width / mapWidth;
    const strideH = height / mapHeight;
    for (let j = 0; j < width; j += strideW) {
      for (let i = 0; i < height; i += strideH) {
        const id = worldMapTerrain.get(j, i);
        const color = TERRAIN_TYPES[id].tileOptions.fgColor;
        worldMap.beginFill(color);
        const x = Math.round(i / strideH);
        const y = Math.round(j / strideW);
        worldMap.drawRect(x, y, 1, 1);
        worldMap.endFill();
      }
    }
    const worldMapTexture = worldMap.generateCanvasTexture();
    const worldMapSprite = new PIXI.Sprite(worldMapTexture);
    this.worldMapContainer.addChild(worldMap);
    this.app.stage.addChild(this.worldMapContainer);
  }

  renderChunk(chunkData: ChunkData) {
    const CELL_SIZE = 16;
    this.mapContainer.removeChildren();

    // const textureIDs = Object.values(TILES)
    //   .map(factory => factory({ fgColor: 0x000000, bgColor: 0xC0C0C0 }, CELL_SIZE));

    for (let y = 0; y < chunkData.terrainTypesMap.shape[0]; y++) {
      for (let x = 0; x < chunkData.terrainTypesMap.shape[1]; x++) {
        const id = chunkData.terrainTypesMap.get(y, x);
        const texture = this.textureIDMap[id];
        if (texture) {
          const land = new PIXI.Sprite(texture);
          land.x = x * CELL_SIZE;
          land.y = y * CELL_SIZE;

          this.mapContainer.addChild(land);
        }
      }
    }

    var basicText = new PIXI.Text('@', {
      fontFamily: 'monospace',
      fontSize: 14,
      fill: '#C0C0C0',
    });
    basicText.x = 0;
    basicText.y = 0;

    // mapContainer.addChild(basicText);
    this.app.stage.addChild(this.mapContainer);
  }
}
