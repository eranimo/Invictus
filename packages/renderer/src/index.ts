import * as PIXI from 'pixi.js';
import * as TILES from './tiles';
import { ChunkData } from '@invictus/generator/mapGenerator';
import { TERRAIN_TYPES_ID_MAP, TERRAIN_TYPES } from '@invictus/generator/terrainTypes';


let textureIDMap = {};

function makeTextureIDMap(): { [id: number]: PIXI.Texture } {
  // make a texture based on each terrain type
  return TERRAIN_TYPES.map(terrainType => TILES.tile_shade2(terrainType.tileOptions, 16));
}

export default class Renderer {
  app: PIXI.Application;
  container: PIXI.Container;
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

    this.container = new PIXI.Container();
    this.container.scale = new PIXI.Point(0.5, 0.5);
  }

  renderChunk(chunkData: ChunkData) {
    const CELL_SIZE = 16;
    this.container.removeChildren();

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

          this.container.addChild(land);
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

    // container.addChild(basicText);
    this.app.stage.addChild(this.container);
  }
}
