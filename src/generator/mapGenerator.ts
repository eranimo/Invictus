import * as Worker from 'worker-loader!./world.worker';
import { PromiseWorker } from 'utils/promiseWorker';
import * as ACTIONS from './actions';
import * as ndarray from 'ndarray';

export interface MapGeneratorSettings {
  size: number;
  seed: number;
  sealevel: number;
}

export interface HeightmapStats {
  avg: number;
  min: number;
  max: number;
}


export type MapStats = HeightmapStats & MapGeneratorSettings;

export interface ChunkData {
  stats: HeightmapStats;
  heightmap: ndarray;
  altitudePercentMap: ndarray;
  terrainTypesMap: ndarray;
  chunkSize: number;
};

export type TileStats = {
  height: number,
  altitudePercent: number;
}

export default class MapGenerator {
  worker: PromiseWorker;
  settings: MapGeneratorSettings
  stats: MapStats;
  chunks: Map<PIXI.Point, ChunkData>;

  constructor(settings) {
    this.settings = settings;
    const worker = new Worker(settings);
    console.log(worker);
    this.worker = new PromiseWorker(worker);
  }

  async init() {
    console.log(this.worker);
    return await this.worker.postMessage(
      ACTIONS.worldInit(this.settings)
    )
    .then((stats: any) => {
      console.log('stats', stats);
      this.stats = Object.assign({}, stats, this.settings);
    });
  }

  async fetchChunk(chunk: PIXI.Point) {
    return await this.worker.postMessage(
      ACTIONS.fetchChunk(chunk)
    )
    .then((chunkData: any) => {
      console.log(chunkData);
      return {
        ...chunkData,
        terrainTypesMap: ndarray(chunkData.terrainTypesMap, [chunkData.chunkSize, chunkData.chunkSize]),
      };
    });
  }
}
