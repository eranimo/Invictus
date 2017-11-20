import * as Worker from './world.worker';
import { PromiseWorker } from '@invictus/worker';
import * as ACTIONS from './actions';
import * as ndarray from 'ndarray';
import Grid from './grid';


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

export interface ChunkGridData {
  height: ndarray;
  altitudePercent: ndarray;
  terrainType: ndarray;
  isRiver: ndarray;
}

export interface ChunkData {
  stats: HeightmapStats;
  grid: Grid<ChunkGridData>,
  chunkSize: number;
};

export interface WorldGridData {
  height: ndarray;
  altitudePercent: ndarray,
  terrainType: ndarray;
  isRiver: ndarray;
  isCoastalCell: ndarray;
}

export interface WorldData {
  stats: HeightmapStats;
  grid: Grid<WorldGridData>,
}

export default class MapGenerator {
  worker: PromiseWorker;
  settings: MapGeneratorSettings
  world: WorldData;
  chunks: Map<string, ChunkData>;

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
      console.log('world map generator data', data);
      this.world = {
        stats: Object.assign({}, data.stats, this.settings),
        grid: Grid.import(this.settings.size, this.settings.size, data.grid),
      };
    });
  }

  async fetchChunk(chunk: PIXI.Point) {
    if (this.chunks.has(hash(chunk))) {
      console.log(`[MapGenerator] fetching chunk (${chunk.x}, ${chunk.y}) from cache`);
      return this.chunks.get(hash(chunk));
    }
    console.log(`[MapGenerator] generating chunk (${chunk.x}, ${chunk.y})`);
    const time = performance.now();
    return await this.worker.postMessage(
      ACTIONS.fetchChunk(chunk)
    )
    .then((chunkData: any) => {
      console.log(`[MapGenerator] execution time: ${Math.round(performance.now() - time)}ms`);
      const { chunkSize, grid, stats } = chunkData;
      const chunkDataConverted = {
        stats,
        chunkSize,
        grid: Grid.import(chunkSize, chunkSize, grid),
      };
      this.chunks.set(hash(chunk), chunkDataConverted);
      return chunkDataConverted;
    });
  }
}
