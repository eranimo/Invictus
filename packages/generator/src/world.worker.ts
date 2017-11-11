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


const NUM_CHUNK_SPAN = 50; // 50 x 50 grid of chunks
const CHUNK_ZOOM = 2; // interpolate 5x world map size
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
  const { size, seed, sealevel } = settings;

  console.log(`Generating world of size (${size}x${size}) (seed: ${seed})`);
  const initial_quality = 3;
  const initial_period = 240;
  const quality = 1; //1 << (5 - initial_quality); // 1 to 5
  let period = initial_period / quality; // 1 to 256
  const falloff = 3; // 0.25 to 16
  const octaves = 7; // 1 to 10

  let worldHeightMap: any = new Uint8ClampedArray(size * size * quality);
  var amplitude;

  if (falloff - 1 == 0) {
    amplitude = (1 / octaves) / falloff;
  } else {
    amplitude = (
      ((falloff - 1) * Math.pow(falloff, octaves)) / (Math.pow(falloff, octaves) - 1)
    ) / falloff;
  }
  console.table({
    amplitude,
    falloff,
    octaves,
    quality,
    period,
  });
  worldHeightMap.fill(0);

  for (var octave = 0; octave < octaves; ++octave) {
    var config = cubicNoiseConfig(seed + octave, period / (octave + 1));

    for (var y = 0; y < Math.floor(size / quality); ++y) {
      for (var x = 0; x < Math.floor(size / quality); ++x) {
        const index = (x + y * size) * quality;
        const nvalue = cubicNoiseSample(config, x, y);
        var value = (nvalue * amplitude) * 255;

        for (var yrep = 0; yrep < quality; ++yrep) {
          for (var xrep = 0; xrep < quality; ++xrep) {
            var repIndex = (index + xrep + yrep * size);

            worldHeightMap[repIndex] += value;
          }
        }
      }
    }

    period /= 2;
    amplitude /= falloff;
  }

  for (var y = 0; y < Math.floor(size / quality); ++y) {
    for (var x = 0; x < Math.floor(size / quality); ++x) {
      const index = (x + y * size) * quality;

      for (var yrep = 0; yrep < quality; ++yrep) {
        for (var xrep = 0; xrep < quality; ++xrep) {
          var repIndex = (index + xrep + yrep * size);
          let value = worldHeightMap[repIndex] / 255;
          const distanceX = Math.abs(x - size * 0.5);
          const distanceY = Math.abs(y - size * 0.5);
          const distance = Math.sqrt(Math.pow(distanceX, 2) + Math.pow(distanceY, 2)) * .6;
          const maxWidth = size * 0.75;
          const delta = (distance / maxWidth);
          const gradient = Math.pow(delta, 2);
          value *= Math.max(0, 1 - (gradient / 1));

          worldHeightMap[repIndex] = value * 255;
        }
      }
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
  const { settings: { size } } = mapState;
  const CHUNK_SPAN = size / NUM_CHUNK_SPAN;
  const STEP = 1 / CHUNK_ZOOM;
  return CHUNK_SPAN * CHUNK_ZOOM;
}

async function generateChunk(chunk: PIXI.Point) {
  const { settings: { size }, stats, worldHeightMap, chunkData } = mapState;
  const CHUNK_SPAN = size / NUM_CHUNK_SPAN;
  const STEP = 1 / CHUNK_ZOOM;
  const chunkSize = getChunkSize();
  const chunkID = `${chunk.x},${chunk.y}`;
  const heightmap = ndarray(
    new Uint8Array(chunkSize * chunkSize),
    [chunkSize, chunkSize]
  );
  console.table({
    initialX: chunk.x * CHUNK_SPAN,
    initialY: chunk.y * CHUNK_SPAN,
    topX: (chunk.x + 1) * CHUNK_SPAN,
    topY: (chunk.y + 1) * CHUNK_SPAN,
    chunkSpan: CHUNK_SPAN,
    step: STEP,
  });

  for (let i = 0; i < CHUNK_SPAN; i += STEP) {
    for (let j = 0; j < CHUNK_SPAN; j += STEP) {
      const x = Math.round(i * CHUNK_ZOOM);
      const y = Math.round(j * CHUNK_ZOOM);
      const value = interpolate(
        worldHeightMap,
        (chunk.y * CHUNK_SPAN) + (i),
        (chunk.x * CHUNK_SPAN) + (j),
      );
      heightmap.set(x, y, value);
    }
  }

  // const stats: HeightmapStats = getHeightmapStats(heightmap);
  const { altitudePercentMap, terrainTypesMap } = decideTerrainTypes(heightmap, stats, chunkSize);
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
