import { zoomableNoise } from './noiseUtils';
import { registerPromiseWorker } from '@invictus/worker';
import * as ACTIONS from './actions';
import * as ndarray from 'ndarray';
import * as ops from 'ndarray-ops';
import * as SimplexNoise from 'simplex-noise';
import * as fill from 'ndarray-fill';
import * as Alea from 'alea';
import * as interpolate from 'ndarray-linear-interpolate';
import terrainTypeFor from './terrainTypes';
import { MapGeneratorSettings, ChunkData, MapStats, HeightmapStats } from './mapGenerator';


const NUM_CHUNK_SPAN = 50; // 50 x 50 grid of chunks
const CHUNK_ZOOM = 5; // interpolate 5x world map size
const context: Worker = self as any;

interface MapState {
  settings?: MapGeneratorSettings;
  stats?: MapStats;
  worldHeightMap?: any;
  chunkData?: { [name: string]: ChunkData };
}

let mapState: MapState = {};

function getHeightmapStats(array: ndarray): HeightmapStats {
  return {
    max: (ops.sup(array) as number),
    min: (ops.inf(array) as number),
    avg: ops.sum(array) / (array.shape[0] * array.shape[1])
  };
}

async function init(settings: MapGeneratorSettings) {
  mapState = {};
  console.log(`Worker`, settings);
  const { size, seed, sealevel } = settings;

  console.log(`Generating world of size (${size}x${size})`);
  const rng = new Alea(seed);
  const simplex = new SimplexNoise(rng);
  const noisesettings = {
    numIterations: 12,
    persistence: 0.6,
    initFrequency: 2,
    zoomLevel: 1,
  };
  const noiseFn = zoomableNoise(simplex.noise2D.bind(simplex))(noisesettings);
  // const noiseFn = (x, y) => simplex.noise2D((x + 1) / 2, (y + 1) / 2);
  let worldHeightMap = ndarray(new Uint8ClampedArray(size * size), [size, size]);
  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      worldHeightMap.set(x, y, noiseFn((x / size) + 0.5, (y / size) + 0.5) * 255);
    }
  }

  const stats = Object.assign({}, settings, getHeightmapStats(worldHeightMap));

  console.log('worldHeightMap', worldHeightMap);

  mapState = { settings, stats, worldHeightMap, chunkData: {} };
  
  console.log(mapState);
  return stats;
}

function getChunkSize() {
  const { settings: { size } } = mapState;
  const CHUNK_SPAN = size / NUM_CHUNK_SPAN;
  const STEP = 1 / CHUNK_ZOOM;
  return CHUNK_SPAN * CHUNK_ZOOM;
}

async function generateChunk(chunk: PIXI.Point) {
  const { settings: { size }, worldHeightMap, chunkData } = mapState;
  const CHUNK_SPAN = size / NUM_CHUNK_SPAN;
  const STEP = 1 / CHUNK_ZOOM;
  const chunkSize = getChunkSize();
  const chunkID = `${chunk.x},${chunk.y}`;
  const heightmap = ndarray(
    new Uint8Array(chunkSize * chunkSize),
    [chunkSize, chunkSize]
  );
  for (let i = chunk.x * CHUNK_SPAN; i < (chunk.x + 1) * CHUNK_SPAN; i += STEP) {
    for (let j = chunk.y * CHUNK_SPAN; j < (chunk.y + 1) * CHUNK_SPAN; j += STEP) {
      const x = Math.round(i * CHUNK_ZOOM);
      const y = Math.round(j * CHUNK_ZOOM);
      const value = interpolate(worldHeightMap, i, j);
      heightmap.set(x, y, value);
    }
  }
  const stats: HeightmapStats = getHeightmapStats(heightmap);
  const { altitudePercentMap, terrainTypesMap } = decideTerrainTypes(heightmap, stats);
  chunkData[chunkID] = {
    stats,
    heightmap,
    altitudePercentMap,
    terrainTypesMap,
    chunkSize,
  };

  return {
    stats,
    heightmap: heightmap.data,
    altitudePercentMap: altitudePercentMap.data,
    terrainTypesMap: terrainTypesMap.data,
    chunkSize,
  };
}

function decideTerrainTypes(heightmap: ndarray, stats: HeightmapStats) {
  const chunkSize = getChunkSize();
  const { settings: { sealevel } } = mapState;
  const altitudePercentMap = ndarray(
    new Float32Array(chunkSize * chunkSize),
    [chunkSize, chunkSize]
  );
  const terrainTypesMap = ndarray([], [chunkSize, chunkSize]);
  for (let x = 0; x < heightmap.shape[0]; x++) {
    for (let y = 0; y < heightmap.shape[1]; y++) {
      const height = heightmap.get(x, y);
      let altitudePercent = height < sealevel
        ? -(sealevel - height) / (sealevel - stats.min)
        : (sealevel - height) / (sealevel - stats.max);
      altitudePercentMap.set(x, y, altitudePercent);
      terrainTypesMap.set(x, y, terrainTypeFor(altitudePercent));
    }
  }
  return { altitudePercentMap, terrainTypesMap };
}

async function fetchChunk(chunk: PIXI.Point) {
  const chunkID = `${chunk.x},${chunk.y}`;
  const chunkData = mapState.chunkData[chunkID];
  if (!chunkData) {
    return await generateChunk(chunk);
  }
  return chunkData;
}

console.log(self);
registerPromiseWorker(context, async message => {
  console.log('worker message', message);
  switch (message.type) {
    case ACTIONS.WORLD_INIT:
      return await init(message.payload);
    case ACTIONS.GENERATE_CHUNK:
      return await generateChunk(message.payload);
    case ACTIONS.FETCH_CHUNK:
      return await fetchChunk(message.payload)
  }
});
