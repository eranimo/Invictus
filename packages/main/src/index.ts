import Renderer from '@invictus/renderer';
import MapGenerator from '@invictus/generator';
import './style.scss';
import * as KeyboardJS from 'keyboardjs';
import { clamp } from 'lodash';

console.log(KeyboardJS);

const mapgen = new MapGenerator({
  size: 1000,
  seed: 1000,
  sealevel: 130,
  // TODO: add chunk span
});

// render();

mapgen.init().then(() => {
  KeyboardJS.watch();
  let renderer = new Renderer();
  console.log('Map generated', mapgen);
  let currentChunk = new PIXI.Point(0, 0);

  function fetchChunk() {
    console.log(`Fetching chunk (${currentChunk.x}, ${currentChunk.y})`);
    mapgen.fetchChunk(currentChunk).then(chunk => {
      console.log('Chunk generated', chunk);
      renderer.renderChunk(chunk);
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
