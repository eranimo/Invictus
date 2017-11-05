import * as PIXI from 'pixi.js';
import * as TILES from './tiles';
import { ChunkData } from '../generator/mapGenerator';
import { TERRAIN_TYPES_ID_MAP, TERRAIN_TYPES } from '../generator/terrainTypes';


const map = [
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 1, 0, 1, 0, 0],
  [0, 1, 1, 2, 1, 1, 0],
  [0, 0, 1, 3, 4, 0, 0],
  [0, 0, 1, 2, 5, 0, 0],
  [0, 0, 0, 0, 0, 0, 0],
  [null],
  [null, 0, 0, 1, 0, 2, 0, 3, 0, 4, 0],
  [null],
  [1, 1, 1, 0],
  [1, 1, 1, 0],
  [1, 1, 1, 0],
  [null],
  [2, 2, 2, 0],
  [2, 2, 2, 0],
  [2, 2, 2, 0],
  [null],
  [3, 3, 3, 0],
  [3, 3, 3, 0],
  [3, 3, 3, 0],
  [null],
  [4, 4, 4, 0],
  [4, 4, 4, 0],
  [4, 4, 4, 0],
  [null],
  [5, 5, 5, 0],
  [5, 5, 5, 0],
  [5, 5, 5, 0],

  [null],
  [2, 2, 2, null, 2, 2, 2, null, 2, 2, 2, null, 2, 2, 2],
  [2, 6, 2, null, 2, 7, 2, null, 2, 8, 2, null, 2, 9, 2],
  [2, 2, 2, null, 2, 2, 2, null, 2, 2, 2, null, 2, 2, 2],

];

let textureIDMap = {};

function makeTextureIDMap(): { [id: number]: PIXI.Texture } {
  // make a texture based on each terrain type
  return TERRAIN_TYPES.map(terrainType => TILES.tile_shade2(terrainType.tileOptions, 16));
}


export default function render(chunkData: ChunkData) {
  var app = new PIXI.Application(800, 600, {
    backgroundColor: 0x111111,
    width: window.innerWidth / window.devicePixelRatio,
    height: window.innerHeight / window.devicePixelRatio,
    resolution: window.devicePixelRatio,
  });
  textureIDMap = makeTextureIDMap();
  document.body.appendChild(app.view);
  const CELL_SIZE = 16;

  const container = new PIXI.Container();
  container.scale = new PIXI.Point(0.5, 0.5);



  const textureIDs = Object.values(TILES)
    .map(factory => factory({ fxColor: 0x000000, bgColor: 0xC0C0C0 }, CELL_SIZE));


  console.log(textureIDs);
  for (let y = 0; y < chunkData.terrainTypesMap.shape[0]; y++) {
    for (let x = 0; x < chunkData.terrainTypesMap.shape[1]; x++) {
      const id = chunkData.terrainTypesMap.get(y, x);
      const texture = textureIDMap[id];
      if (texture) {
        const land = new PIXI.Sprite(texture);
        land.x = x * CELL_SIZE;
        land.y = y * CELL_SIZE;

        container.addChild(land);
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
  app.stage.addChild(container);
}
