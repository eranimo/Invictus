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
import { cubicNoiseSample, cubicNoiseConfig } from './cubic';


const context: Worker = self as any;

interface MapState {
  settings?: MapGeneratorSettings;
  stats?: MapStats;
  worldHeightMap?: any;
  world?: ChunkData;
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
  const { size, seed, sealevel, period, falloff, octaves } = settings;

  console.log(`Generating world of size (${size}x${size}) (seed: ${seed})`);
  let current_period = period; // 1 to 256

  let worldHeightMap: any = new Uint8ClampedArray(size * size);
  worldHeightMap.fill(0);
  
  let amplitude;
  if (falloff - 1 == 0) {
    amplitude = (1 / octaves) / falloff;
  } else {
    amplitude = (
      ((falloff - 1) * Math.pow(falloff, octaves)) / (Math.pow(falloff, octaves) - 1)
    ) / falloff;
  }

  // multiple-octave cubic noise
  for (var octave = 0; octave < octaves; ++octave) {
    let config = cubicNoiseConfig(seed + octave, current_period / (octave + 1));

    for (let x = 0; x < size; ++x) {
      for (let y = 0; y < size; ++y) {
        const index = x + y * size;
        const nvalue = cubicNoiseSample(config, x, y);
        const value = (nvalue * amplitude) * 255;

        worldHeightMap[index] += value;
      }
    }

    current_period /= 2;
    amplitude /= falloff;
  }

  // apply mask to lower edge of map
  for (var y = 0; y < size; ++y) {
    for (var x = 0; x < size; ++x) {
      const index = x + y * size;
      let value = worldHeightMap[index] / 255;
      const distanceX = Math.abs(x - size * 0.5);
      const distanceY = Math.abs(y - size * 0.5);
      const distance = Math.sqrt(Math.pow(distanceX, 2) + Math.pow(distanceY, 2)) * .6;
      const maxWidth = size * 0.75;
      const delta = (distance / maxWidth);
      const gradient = Math.pow(delta, 2);
      value *= Math.max(0, 1 - (gradient / 1));

      worldHeightMap[index] = value * 255;
    }
  }

  worldHeightMap = ndarray(worldHeightMap, [size, size]);
  const worldStats = getHeightmapStats(worldHeightMap);
  const stats = Object.assign({}, settings, worldStats);

  console.log('worldHeightMap', worldHeightMap);
  mapState = { settings, stats, worldHeightMap, chunkData: {} };

  const { altitudePercentMap, terrainTypesMap } = decideTerrainTypes(worldHeightMap, stats, size);

  const world: ChunkData = {
    stats: worldStats,
    heightmap: worldHeightMap,
    altitudePercentMap,
    terrainTypesMap,
    chunkSize: size,
  };
  mapState.world = world;
  
  console.log(mapState);
  return { stats, worldMapTerrain: world.terrainTypesMap.data };
}

function getChunkSize() {
  const { settings: { size, chunkSpan, chunkZoom } } = mapState;
  const CHUNK_SIZE = size / chunkSpan;
  const STEP = 1 / chunkZoom;
  return CHUNK_SIZE * chunkZoom;
}

async function generateChunk(chunk: PIXI.Point) {
  const {
    settings: { seed, size, chunkSpan, chunkZoom, period, falloff, octaves },
    stats, worldHeightMap, chunkData
  } = mapState;
  const CHUNK_SIZE = (size / chunkSpan) * chunkZoom;
  const STEP = 1 / chunkZoom;
  const chunkSize = getChunkSize();
  const chunkID = `${chunk.x},${chunk.y}`;
  const chunkHeightmap = ndarray(
    new Uint8Array(chunkSize * chunkSize),
    [chunkSize, chunkSize]
  );
  fill(chunkHeightmap, () => 0);

  let current_period = period;
  let current_octaves = octaves;
  let current_falloff = falloff;

  let amplitude;
  if (current_falloff - 1 == 0) {
    amplitude = (1 / current_octaves) / current_falloff;
  } else {
    amplitude = (
      ((current_falloff - 1) * Math.pow(current_falloff, current_octaves)) /
      (Math.pow(current_falloff, current_octaves) - 1)
    ) / current_falloff;
  }

  for (var octave = 0; octave < current_octaves; ++octave) {
    let config = cubicNoiseConfig(seed + octave, current_period / (octave + 1));
  
    for (let i = 0; i < CHUNK_SIZE; i++) {
      for (let j = 0; j < CHUNK_SIZE; j++) {
        const localX = (i + (chunk.x * CHUNK_SIZE)) / chunkZoom;
        const localY = (j + (chunk.y * CHUNK_SIZE)) / chunkZoom;
        const nvalue = cubicNoiseSample(config, localY, localX);
        const value = chunkHeightmap.get(i, j) + (nvalue * amplitude) * 255;
        chunkHeightmap.set(i, j, value);
      }
    }

    current_period /= 2;
    amplitude /= current_falloff;
  }

  // apply mask to lower edge of map
  for (let i = 0; i < CHUNK_SIZE; i++) {
    for (let j = 0; j < CHUNK_SIZE; j++) {
      let value = chunkHeightmap.get(i, j) / 255;
      const localX = (i + (chunk.x * CHUNK_SIZE)) / chunkZoom;
      const localY = (j + (chunk.y * CHUNK_SIZE)) / chunkZoom;
      const distanceX = Math.abs(localX - size * 0.5);
      const distanceY = Math.abs(localY - size * 0.5);
      const distance = Math.sqrt(Math.pow(distanceX, 2) + Math.pow(distanceY, 2)) * .6;
      const maxWidth = size * 0.75;
      const delta = (distance / maxWidth);
      const gradient = Math.pow(delta, 2);
      value *= Math.max(0, 1 - (gradient / 1));

      chunkHeightmap.set(i, j, value * 255);
    }
  }

  // const stats: HeightmapStats = getHeightmapStats(heightmap);
  const { altitudePercentMap, terrainTypesMap } = decideTerrainTypes(chunkHeightmap, stats, chunkSize);
  chunkData[chunkID] = {
    stats,
    heightmap: chunkHeightmap,
    altitudePercentMap,
    terrainTypesMap,
    chunkSize,
  };

  return {
    stats,
    heightmap: chunkHeightmap.data,
    altitudePercentMap: altitudePercentMap.data,
    terrainTypesMap: terrainTypesMap.data,
    chunkSize,
  };
}

function decideTerrainTypes(heightmap: ndarray, stats: HeightmapStats, size: number) {
  const { settings: { sealevel } } = mapState;
  const altitudePercentMap = ndarray(
    new Float32Array(size * size),
    [size, size]
  );
  const terrainTypesMap = ndarray([], [size, size]);
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
  console.log(`[worker] Fetch chunk (${chunk.x}, ${chunk.y})`);
  const chunkID = `${chunk.x},${chunk.y}`;
  const chunkData = mapState.chunkData[chunkID];
  if (!chunkData) {
    return await generateChunk(chunk);
  }
  return chunkData;
}

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
