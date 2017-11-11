import Renderer from '@invictus/renderer';
import MapGenerator from '@invictus/generator';
import './style.scss';
import * as KeyboardJS from 'keyboardjs';
import { clamp } from 'lodash';

console.log(KeyboardJS);

const mapgen = new MapGenerator({
  size: 1000,
  seed: 12312354786756, // Math.random(),
  chunkSpan: 50,
  chunkZoom: 2,
  sealevel: 130,
  period: 240,
  falloff: 3,
  octaves: 7,
});

// render();

mapgen.init().then(() => {
  KeyboardJS.watch();
  let renderer = new Renderer();
  renderer.renderWorldMap(mapgen.worldMapTerrain);
  console.log('Map generated', mapgen);
  let currentChunk = new PIXI.Point(25, 25);

  function fetchChunk() {
    console.log(`Fetching chunk (${currentChunk.x}, ${currentChunk.y})`);
    mapgen.fetchChunk(currentChunk).then(chunk => {
      console.log('Chunk generated', chunk);
      renderer.renderChunk(chunk);
      renderer.changeWorldMapCursor(currentChunk);
    });
  }

  fetchChunk();

  KeyboardJS.bind('right', null, event => {
    currentChunk.x += 1;
    currentChunk.x = clamp(currentChunk.x, 0, 50);
    currentChunk.y = clamp(currentChunk.y, 0, 50);
    fetchChunk();
  });

  KeyboardJS.bind('left', null, event => {
    currentChunk.x -= 1;
    currentChunk.x = clamp(currentChunk.x, 0, 50);
    currentChunk.y = clamp(currentChunk.y, 0, 50);
    fetchChunk();
  });

  KeyboardJS.bind('up', null, event => {
    currentChunk.y -= 1;
    currentChunk.x = clamp(currentChunk.x, 0, 50);
    currentChunk.y = clamp(currentChunk.y, 0, 50);
    fetchChunk();
  });

  KeyboardJS.bind('down', null, event => {
    currentChunk.y += 1;
    currentChunk.x = clamp(currentChunk.x, 0, 50);
    currentChunk.y = clamp(currentChunk.y, 0, 50);
    fetchChunk();
  });
});
