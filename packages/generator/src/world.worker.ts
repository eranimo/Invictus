import { zoomableNoise } from './noiseUtils';
import { registerPromiseWorker } from '@invictus/worker';
import * as ACTIONS from './actions';
import * as ndarray from 'ndarray';
import * as ndbits from 'ndarray-bit';
import * as ops from 'ndarray-ops';
import * as SimplexNoise from 'simplex-noise';
import * as fill from 'ndarray-fill';
import * as Alea from 'alea';
import * as interpolate from 'ndarray-linear-interpolate';
import terrainTypeFor from './terrainTypes';
import { MapGeneratorSettings, ChunkData, MapStats, HeightmapStats } from './mapGenerator';
import { cubicNoiseSample, cubicNoiseConfig } from './cubic';
import * as _ from 'lodash';


const context: Worker = self as any;

interface MapState {
  settings?: MapGeneratorSettings;
  stats?: MapStats;
  worldHeightMap?: any;
  world?: ChunkData;
  chunkData?: { [name: string]: ChunkData };
}

// find 8-neighbors in an ndarray
const neighbor4 = (x, y) => [
  [x - 1, y],
  [x + 1, y],
  [x, y - 1],
  [x, y + 1],
];

const neighbor8 = (x, y) => [
  [x - 1, y],
  [x + 1, y],
  [x, y - 1],
  [x, y + 1],
  [x + 1, y + 1],
  [x - 1, y - 1],
  [x - 1, y + 1],
  [x + 1, y - 1],
];
function findNeighbor(array: ndarray, x: number, y: number, func: (cell: any) => boolean)  {
  return _(neighbor4(x, y))
    .map(([x, y]) => array.get(x, y)) // get cell value
    .filter(i => i) // remove cells outside range
    .find(func) // perform test function
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

  // find coastal cells
  const coastalCells = ndarray([], [size, size]);
  fill(coastalCells, () => 0);

  // a cell is on the coast if at least one neighbor is ocean and this cell is land
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      const value = worldHeightMap.get(i, j);
      if (
        value >= sealevel &&
        findNeighbor(worldHeightMap, i, j, cell => cell < sealevel)
      ) {
        coastalCells.set(i, j, 1);
      }
    }
  }
  const totalCoastalCells = ops.sum(coastalCells);
  console.log(`There are ${totalCoastalCells} coastal cells in the world map`);

  const { altitudePercentMap, terrainTypesMap } = decideTerrainTypes(worldHeightMap, stats, size);

  const world: ChunkData = {
    stats: worldStats,
    heightmap: worldHeightMap,
    altitudePercentMap,
    terrainTypesMap,
    coastalCells: coastalCells,
    chunkSize: size,
  };
  mapState.world = world;
  
  console.log(mapState);
  return {
    stats,
    worldMapTerrain: world.terrainTypesMap.data,
    coastalCells: world.coastalCells.data,
  };
}

function getChunkSize() {
  const { settings: { size, chunkSpan, chunkZoom } } = mapState;
  const CHUNK_SIZE = size / chunkSpan;
  const STEP = 1 / chunkZoom;
  return CHUNK_SIZE * chunkZoom;
}

async function generateChunk(chunk: PIXI.Point) {
  const {
    settings: {
      seed,
      size,
      chunkSpan,
      chunkZoom,
      period,
      falloff,
      octaves,
      sealevel
    },
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
        const localX = (chunk.x * (size / chunkSpan)) + (i / chunkZoom);
        const localY = (chunk.y * (size / chunkSpan)) + (j / chunkZoom);
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

  // DEBUG: chunk height = world height
  // for (let i = 0; i < CHUNK_SIZE; i++) {
  //   for (let j = 0; j < CHUNK_SIZE; j++) {
  //     const localX = (chunk.x * (size / chunkSpan)) + Math.round(i / chunkZoom);
  //     const localY = (chunk.y * (size / chunkSpan)) + Math.round(j / chunkZoom);
  //     let height = worldHeightMap.get(localX, localY);

  //     chunkHeightmap.set(i, j, height);
  //   }
  // }

  const coastalCells = ndarray([], [CHUNK_SIZE, CHUNK_SIZE]);
  fill(coastalCells, () => 0);

  for (let i = 0; i < CHUNK_SIZE; i++) {
    for (let j = 0; j < CHUNK_SIZE; j++) {
      let chunkHeight = chunkHeightmap.get(i, j) / 255;
      const localX = (chunk.x * (size / chunkSpan)) + Math.round(i / chunkZoom);
      const localY = (chunk.y * (size / chunkSpan)) + Math.round(j / chunkZoom);
      let isCoastalCellWorld = mapState.world.coastalCells.get(localX, localY);
      if (isCoastalCellWorld) {
        coastalCells.set(i, j, 1);
      }
    }
  }

  const totalCoastalCells = ops.sum(coastalCells);
  console.log(`There are ${totalCoastalCells} coastal cells in this chunk`);

  const riverMap = ndarray(
    new Uint8Array(chunkSize * chunkSize),
    [chunkSize, chunkSize]
  );
  fill(riverMap, () => 0);

  // for (let i = 0; i < CHUNK_SIZE; i++) {
  //   for (let j = 0; j < CHUNK_SIZE; j++) {
  //     const valueChunk = chunkHeightmap.get(i, j);
  //     const localX = (i + (chunk.x * CHUNK_SIZE)) / chunkZoom;
  //     const localY = (j + (chunk.y * CHUNK_SIZE)) / chunkZoom;
  //     const valueWorld = worldHeightMap.get(localX, localY);
  //     const worldIsCoast = coastalCells.get(localX, localY);
  //     if (worldIsCoast) {

  //     }

  //     if (valueChunk === sealevel && valueWorld === sealevel) {
  //       riverMap.set(i, j, 1);
  //     }
  //   }
  // }

  const chunkStats: HeightmapStats = getHeightmapStats(chunkHeightmap);
  const { altitudePercentMap, terrainTypesMap } = decideTerrainTypes(chunkHeightmap, stats, chunkSize);
  chunkData[chunkID] = {
    stats: chunkStats,
    heightmap: chunkHeightmap,
    altitudePercentMap,
    terrainTypesMap,
    coastalCells,
    riverMap,
    chunkSize,
  };

  return {
    stats: chunkStats,
    heightmap: chunkHeightmap.data,
    altitudePercentMap: altitudePercentMap.data,
    terrainTypesMap: terrainTypesMap.data,
    coastalCells: coastalCells.data,
    riverMap: riverMap.data,
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
