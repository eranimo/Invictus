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
import {
  MapGeneratorSettings,
  WorldData,
  ChunkData,
  MapStats,
  HeightmapStats,
  ChunkGridData,
  WorldGridData
} from './mapGenerator';
import * as _ from 'lodash';
import Grid from './grid';


class RiverSegment {
  start: PIXI.Point;
  end: PIXI.Point;
  path: PIXI.Point[];

  constructor(start: PIXI.Point, end: PIXI.Point) {
    this.start = start;
    this.end = end;
  }
}

const gridDirections = {
  up: (x, y) => [x, y - 1],
  down: (x, y) => [x, y + 1],
  left: (x, y) => [x - 1, y],
  right: (x, y) => [x + 1, y],
};

const gridDirectionsOpposite = {
  up: gridDirections.down,
  down: gridDirections.up,
  left: gridDirections.right,
  right: gridDirections.left,
};

// tests two sides (primary and secondary) of a cell in 4-neighbor space
// returns the coordinates of the secondary side for the first pair that matches
function testOppositeSides(
  testPrimary: (x: number, y: number) => boolean,
  testSecondary: (x: number, y: number) => boolean,
  x: number,
  y: number
): [number, number] {
  for (let [key, value] of Object.entries(gridDirections)) {
    const [i1, j1] = value(x, y);
    const [i2, j2] = gridDirectionsOpposite[key](x, y)
    if (testPrimary(i1, j2) && testSecondary(i2, j2)) {
      return [i2, j2];
    }
  }
}

const context: Worker = self as any;

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

interface WorkerState {
  settings: MapGeneratorSettings;
  world: WorldData;
  chunks: Map<string, ChunkData>;
}

let state: WorkerState;

function getHeightmapStats(array: ndarray): HeightmapStats {
  return {
    max: (ops.sup(array) as number),
    min: (ops.inf(array) as number),
    avg: ops.sum(array) / (array.shape[0] * array.shape[1])
  };
}

const NOISE_OPTIONS = {
  numIterations: 10,
  persistence: 0.6,
  initFrequency: 2,
};

function makeHeightmap({ seed, size, zoomLevel, position }) {
  const heightmap = ndarray(new Float32Array(size * size), [size, size]);

  const rng = new Alea(seed);
  const simplex = new SimplexNoise(rng);
  const noise = (nx, ny) => simplex.noise2D(nx, ny);

  fill(heightmap, (x, y) => {
    const nx = (x + position.x) / zoomLevel;
    const ny = (y + position.y) / zoomLevel;
    return zoomableNoise(noise)(NOISE_OPTIONS)(nx / size + 0.5, ny / size + 0.5) * 255;
  });
  return heightmap;
}

async function init(settings: MapGeneratorSettings) {
  console.log(`Worker`, settings);
  const { size, seed, sealevel, period, falloff, octaves } = settings;

  console.log(`Generating world of size (${size}x${size}) (seed: ${seed})`);
  let current_period = period; // 1 to 256

  let worldHeightMap: any = makeHeightmap({
    seed, size,
    position: { x: 0, y: 0 },
    zoomLevel: 1,
  });

  // apply mask to lower edge of map
  for (var y = 0; y < size; ++y) {
    for (var x = 0; x < size; ++x) {
      let value = worldHeightMap.get(x, y) / 255;
      const distanceX = Math.abs(x - size * 0.5);
      const distanceY = Math.abs(y - size * 0.5);
      const distance = Math.sqrt(Math.pow(distanceX, 2) + Math.pow(distanceY, 2)) * .6;
      const maxWidth = size * 0.75;
      const delta = (distance / maxWidth);
      const gradient = Math.pow(delta, 2);
      value *= Math.max(0, 1 - (gradient / 1));

      worldHeightMap.set(x, y, value * 255);
    }
  }

  const worldStats = getHeightmapStats(worldHeightMap);
  const stats = Object.assign({}, settings, worldStats);

  console.log('worldHeightMap', worldHeightMap);

  // find coastal cells
  const coastalCells = ndarray([], [size, size]);
  fill(coastalCells, () => 0);

  // a cell is on the coast if at least one neighbor is ocean and this cell is land
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      const value = worldHeightMap.get(i, j);
      if (
        value >= sealevel &&
        findNeighbor(worldHeightMap, i, j, cell => cell < sealevel) &&
        findNeighbor(worldHeightMap, i, j, cell => cell >= sealevel)
      ) {
        coastalCells.set(i, j, 1);
      }
    }
  }
  const totalCoastalCells = ops.sum(coastalCells);
  console.log(`There are ${totalCoastalCells} coastal cells in the world map`);



  /* River algorithm

  
  River systems are tree data structures.
  Each node is a river source, end, or fork.
  
  GENERATING
  - pick river sources from coastal cells
  - create first river edge (trunk)
  - river edge step:
    - decide edge direction:
      - if ocean is above river source with land below, direction is down
      - if ocean is below river source with land above, direction is up
      - if ocean is left of river source with land to the right, direction is right
      - if ocean is right of river source with land to the left, direction is left
    - walk along e number of cells in edge direction
      where e is large for trunk and small for branches
      - if any cells encountered while walking are ocean:
        - river edge is not valid
      - if any cells encountered while walking are other rivers:
        - stop river edge at 2 cells before other river cell

    - if edge is valid, perform A* from current node to new node
      - store path in river edge data structure

  - create new river edges randomly along first river edge (branches)
  */
  const riverMap = ndarray(new Uint8ClampedArray(size * size), [size, size]);
  fill(riverMap, () => 0);
  const COASTAL_RIVER_CHANCE = 0.1;
  let riverSources = [];
  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      const isCoastal = coastalCells.get(x, y);

      if (isCoastal * Math.random() < COASTAL_RIVER_CHANCE) {
        const result = testOppositeSides(
          (i, j) => worldHeightMap.get(i, j) >= sealevel && coastalCells.get(i, j) === 0,
          (i, j) => worldHeightMap.get(i, j) < sealevel,
          x, y
        );
        if (result) {
          riverMap.set(x, y, 1);
          riverMap.set(result[0], result[1], 1);
        }
      }
    }
  }


  const { altitudePercentMap, terrainTypesMap } = decideTerrainTypes(settings, worldHeightMap, stats, size);
  const grid = new Grid<WorldGridData>(size, size, {
    height: worldHeightMap,
    altitudePercent: altitudePercentMap,
    terrainType: terrainTypesMap,
    isRiver: riverMap,
    isCoastalCell: coastalCells,
  });
  const world = {
    stats,
    grid,
  };
  state = {
    settings,
    world,
    chunks: new Map(),
  };
  
  console.log('[worker] state', state);

  return { stats, grid: grid.export()[0] };
}

function getChunkSize() {
  const { settings: { size, chunkSpan, chunkZoom } } = state;
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
    world: { stats },
  } = state;
  const CHUNK_SIZE = (size / chunkSpan) * chunkZoom;
  const STEP = 1 / chunkZoom;
  const chunkSize = getChunkSize();
  const chunkID = `${chunk.x},${chunk.y}`;

  let chunkHeightMap: any = makeHeightmap({
    seed,
    size: chunkSize,
    zoomLevel: chunkSpan,
    position: {
      x: chunk.x * CHUNK_SIZE,
      y: chunk.y * CHUNK_SIZE,
    },
  });

  // apply mask to lower edge of map
  for (let i = 0; i < CHUNK_SIZE; i++) {
    for (let j = 0; j < CHUNK_SIZE; j++) {
      let value = chunkHeightMap.get(i, j) / 255;
      const localX = (i + (chunk.x * CHUNK_SIZE)) / chunkZoom;
      const localY = (j + (chunk.y * CHUNK_SIZE)) / chunkZoom;
      const distanceX = Math.abs(localX - size * 0.5);
      const distanceY = Math.abs(localY - size * 0.5);
      const distance = Math.sqrt(Math.pow(distanceX, 2) + Math.pow(distanceY, 2)) * .6;
      const maxWidth = size * 0.75;
      const delta = (distance / maxWidth);
      const gradient = Math.pow(delta, 2);
      value *= Math.max(0, 1 - (gradient / 1));

      chunkHeightMap.set(i, j, value * 255);
    }
  }

  // DEBUG: chunk height = world height
  // for (let i = 0; i < CHUNK_SIZE; i++) {
  //   for (let j = 0; j < CHUNK_SIZE; j++) {
  //     const localX = (chunk.x * (size / chunkSpan)) + Math.round(i / chunkZoom);
  //     const localY = (chunk.y * (size / chunkSpan)) + Math.round(j / chunkZoom);
  //     let height = state.world.grid.getField(localX, localY, 'height');

  //     chunkHeightMap.set(i, j, height);
  //   }
  // }

  const coastalCells = ndarray([], [CHUNK_SIZE, CHUNK_SIZE]);
  fill(coastalCells, () => 0);

  for (let i = 0; i < CHUNK_SIZE; i++) {
    for (let j = 0; j < CHUNK_SIZE; j++) {
      let value = chunkHeightMap.get(i, j);
      let chunkHeight = chunkHeightMap.get(i, j) / 255;
      const localX = (chunk.x * (size / chunkSpan)) + Math.round(i / chunkZoom);
      const localY = (chunk.y * (size / chunkSpan)) + Math.round(j / chunkZoom);
      let isCoastalCellWorld = state.world.grid.getField(localX, localY, 'isCoastalCell');
      if (
        isCoastalCellWorld &&
        value >= sealevel &&
        findNeighbor(chunkHeightMap, i, j, cell => cell < sealevel) &&
        findNeighbor(chunkHeightMap, i, j, cell => cell >= sealevel)
      ) {
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

  const chunkStats: HeightmapStats = getHeightmapStats(chunkHeightMap);
  const { altitudePercentMap, terrainTypesMap } = decideTerrainTypes(state.settings, chunkHeightMap, stats, chunkSize);
  const grid = new Grid<ChunkGridData>(chunkSize, chunkSize, {
    height: chunkHeightMap,
    altitudePercent: altitudePercentMap,
    terrainType: terrainTypesMap,
    isRiver: riverMap,
  });

  state.chunks.set(chunkID, {
    stats: chunkStats,
    grid,
    chunkSize,
  });

  return { stats: chunkStats, chunkSize, grid: grid.export()[0] };
}

function decideTerrainTypes(settings, heightmap: ndarray, stats: HeightmapStats, size: number) {
  const { sealevel } = settings;
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
  const chunkData = state.chunks.get(chunkID);
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
