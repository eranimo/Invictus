export const WORLD_INIT = 'WORLD_INIT';
export const worldInit = (options) => ({ type: WORLD_INIT, payload: options });

export const GENERATE_CHUNK = 'GENERATE_CHUNK';
export const generateChunk = (chunk: PIXI.Point) => ({ type: GENERATE_CHUNK, payload: chunk });

export const FETCH_CHUNK = 'FETCH_CHUNK';
export const fetchChunk = (chunk: PIXI.Point) => ({ type: FETCH_CHUNK, payload: chunk });
