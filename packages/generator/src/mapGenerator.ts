import * as Worker from './world.worker';
import { PromiseWorker } from '@invictus/worker';
import * as ACTIONS from './actions';
import * as ndarray from 'ndarray';


function hash(point: PIXI.Point) {
  return `${point.x},${point.y}`;
}

export interface MapGeneratorSettings {
  size: number;
  seed: number;
  sealevel: number;
  period: number;
  falloff: number;
  octaves: number;
  chunkSpan: number;
  chunkZoom: number;
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
  chunks: Map<string, ChunkData>;
  worldMapTerrain: ndarray;

  constructor(settings) {
    this.settings = settings;
    const worker = new (Worker as any)(settings);
    console.log(worker);
    this.worker = new PromiseWorker(worker);
  }

  async init() {
    this.chunks = new Map();
    console.log(this.worker);
    return await this.worker.postMessage(
      ACTIONS.worldInit(this.settings)
    )
    .then((data: any) => {
      console.log('stats', data.stats);
      this.stats = Object.assign({}, data.stats, this.settings);
      this.worldMapTerrain = ndarray(data.worldMapTerrain, [this.settings.size, this.settings.size]);
      console.log('world', this.worldMapTerrain);
    });
  }

  async fetchChunk(chunk: PIXI.Point) {
    if (this.chunks.has(hash(chunk))) {
      console.log(`[MapGenerator] fetching chunk (${chunk.x}, ${chunk.y}) from cache`);
      return this.chunks.get(hash(chunk));
    }
    console.log(`[MapGenerator] generating chunk (${chunk.x}, ${chunk.y})`);
    return await this.worker.postMessage(
      ACTIONS.fetchChunk(chunk)
    )
    .then((chunkData: any) => {
      const chunkDataConverted = {
        ...chunkData,
        heightmap: ndarray(chunkData.heightmap, [chunkData.chunkSize, chunkData.chunkSize]),
        terrainTypesMap: ndarray(chunkData.terrainTypesMap, [chunkData.chunkSize, chunkData.chunkSize]),
      };
      this.chunks.set(hash(chunk), chunkDataConverted);
      return chunkDataConverted;
    });
  }
}
