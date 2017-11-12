import { MapStats, TileStats } from './mapGenerator';
import { TileOptions } from '@invictus/renderer/tileUtils';

export type TerrainType = {
  id: number;
  name: string;
  tileOptions: TileOptions,
  test(altitudePercent: number): boolean
}

const OCEAN_COLOR = 0x3056ad;
const SHELF_COLOR = 0x315ec6;
const LITTORAL_COLOR = 0x4e77d8;
const LOWLAND_COLOR = 0x6d5d3e;
const HIGHLAND_COLOR = 0x594929;
const BG_COLOR = 0x111;

const SHELF_CUTOFF = -0.3;
const LITTORAL_CUTOFF = -0.05;
const HIGHLAND_CUTOFF = 0.65;

export const ocean: TerrainType = {
  id: 0,
  name: 'Ocean',
  tileOptions: { fgColor: OCEAN_COLOR, bgColor: BG_COLOR },
  test: (altitudePercent: number) => altitudePercent < SHELF_CUTOFF,
}

export const continental_shelf: TerrainType = {
  id: 1,
  name: 'Continental Shelf',
  tileOptions: { fgColor: SHELF_COLOR, bgColor: BG_COLOR },
  test: (altitudePercent: number) => altitudePercent >= SHELF_CUTOFF && altitudePercent < LITTORAL_CUTOFF,
}

export const littoral_zone: TerrainType = {
  id: 2,
  name: 'Littoral Shelf',
  tileOptions: { fgColor: LITTORAL_COLOR, bgColor: BG_COLOR },
  test: (altitudePercent: number) => altitudePercent >= LITTORAL_CUTOFF && altitudePercent < 0,
}

export const lowland: TerrainType = {
  id: 3,
  name: 'Lowland',
  tileOptions: { fgColor: LOWLAND_COLOR, bgColor: BG_COLOR },
  test: (altitudePercent: number) => altitudePercent <= HIGHLAND_CUTOFF && altitudePercent >= 0,
}


export const highland: TerrainType = {
  id: 4,
  name: 'Highland',
  tileOptions: { fgColor: HIGHLAND_COLOR, bgColor: BG_COLOR },
  test: (altitudePercent: number) => altitudePercent > HIGHLAND_CUTOFF,
}

export const TERRAIN_TYPES_ID_MAP = {};
export const TERRAIN_TYPES = [
  ocean,
  continental_shelf,
  littoral_zone,
  lowland,
  highland
];
for (const item of TERRAIN_TYPES) {
  TERRAIN_TYPES_ID_MAP[item.id] = item;
}

export default function (altitudePercent: number) {
  try {
    return TERRAIN_TYPES.find(type => type.test(altitudePercent)).id;
  } catch (e) {
    throw new Error(`No terrain for following properties: altitudePercent: ${altitudePercent}`);
  }
}
