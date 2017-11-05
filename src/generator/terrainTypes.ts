import { MapStats, TileStats } from './mapGenerator';
import { TileOptions } from '../render/tileUtils';

export type TerrainType = {
  id: number;
  name: string;
  tileOptions: TileOptions,
  test(altitudePercent: number): boolean
}

const OCEAN_COLOR = 0x2a4dd6;
const SHELF_COLOR = 0x315ec6;
const LOWLAND_COLOR = 0x998151;
const HIGHLAND_COLOR = 0x594929;
const BG_COLOR = 0x111;

export const ocean: TerrainType = {
  id: 0,
  name: 'Ocean',
  tileOptions: { fgColor: OCEAN_COLOR, bgColor: BG_COLOR },
  test: (altitudePercent: number) => altitudePercent < -0.5,
}

export const continental_shelf: TerrainType = {
  id: 1,
  name: 'Continental Shelf',
  tileOptions: { fgColor: SHELF_COLOR, bgColor: BG_COLOR },
  test: (altitudePercent: number) => altitudePercent >= -0.5 && altitudePercent < 0,
}

export const lowland: TerrainType = {
  id: 2,
  name: 'Lowland',
  tileOptions: { fgColor: LOWLAND_COLOR, bgColor: BG_COLOR },
  test: (altitudePercent: number) => altitudePercent <= 0.75 && altitudePercent >= 0,
}


export const highland: TerrainType = {
  id: 3,
  name: 'Highland',
  tileOptions: { fgColor: HIGHLAND_COLOR, bgColor: BG_COLOR },
  test: (altitudePercent: number) => altitudePercent > 0.75,
}

export const TERRAIN_TYPES_ID_MAP = {};
export const TERRAIN_TYPES = [ocean, continental_shelf, lowland, highland];
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
