// import Renderer from '@invictus/renderer';
// import MapGenerator from '@invictus/generator';
import './style.scss';
// import * as KeyboardJS from 'keyboardjs';
import { clamp } from 'lodash';
import { SceneTree, Node, Tilemap, Viewport, Preloader } from '@invictus/engine';

async function setup() {
  const scene = new SceneTree();
  const root = new Viewport('viewport');

  // preload things
  const preloader = new Preloader('resources');
  const tilemapImg = await import('@invictus/renderer/images/tilemap.png');
  await preloader.add('tilemap', tilemapImg);
  root.addChild(preloader);

  const tilemap = new Tilemap('tilemap');
  root.addChild(tilemap);
  await scene.changeScene(root);
  console.log(preloader.resources);
  scene.start();
}

setup();


// if (module.hot) module.hot.accept('./scenes', setup);


// const mapgen = new MapGenerator({
//   size: 1000,
//   seed: 12312354786756, // Math.random(),
//   chunkSpan: 50,
//   chunkZoom: 2,
//   sealevel: 130,
//   period: 240,
//   falloff: 3,
//   octaves: 7,
// });

// // render();
// const initialChunk = {
//   x: localStorage.INITIAL_CHUNK_X || 25,
//   y: localStorage.INITIAL_CHUNK_Y || 25,
// };

// mapgen.init().then(() => {
//   KeyboardJS.watch();
//   let renderer = new Renderer();
//   renderer.renderWorldMap(mapgen.world);
//   console.log('Map generated', mapgen);
//   let currentChunk = new PIXI.Point(initialChunk.x, initialChunk.y);
//   let currentZLevel = mapgen.settings.sealevel;
//   let chunkData;

//   function fetchChunk() {
//     console.log(`Fetching chunk (${currentChunk.x}, ${currentChunk.y})`);
//     mapgen.fetchChunk(currentChunk).then(chunk => {
//       console.log('Chunk generated', chunk);
//       chunkData = chunk;
//       renderer.renderChunk(chunkData, currentZLevel);
//       renderer.changeWorldMapCursor(currentChunk);
//     });
//     localStorage.INITIAL_CHUNK_X = currentChunk.x;
//     localStorage.INITIAL_CHUNK_Y = currentChunk.y;
//   }

//   fetchChunk();

//   KeyboardJS.bind('d', null, event => {
//     currentChunk.x += 1;
//     currentChunk.x = clamp(currentChunk.x, 0, 50);
//     currentChunk.y = clamp(currentChunk.y, 0, 50);
//     fetchChunk();
//   });

//   KeyboardJS.bind('a', null, event => {
//     currentChunk.x -= 1;
//     currentChunk.x = clamp(currentChunk.x, 0, 50);
//     currentChunk.y = clamp(currentChunk.y, 0, 50);
//     fetchChunk();
//   });

//   KeyboardJS.bind('w', null, event => {
//     currentChunk.y -= 1;
//     currentChunk.x = clamp(currentChunk.x, 0, 50);
//     currentChunk.y = clamp(currentChunk.y, 0, 50);
//     fetchChunk();
//   });

//   KeyboardJS.bind('s', null, event => {
//     currentChunk.y += 1;
//     currentChunk.x = clamp(currentChunk.x, 0, 50);
//     currentChunk.y = clamp(currentChunk.y, 0, 50);
//     fetchChunk();
//   });

//   KeyboardJS.bind('up', null, event => {
//     currentZLevel += 1;
//     console.log(`New Z-level: ${currentZLevel}`);
//     renderer.renderChunk(chunkData, currentZLevel);
//   });

//   KeyboardJS.bind('down', null, event => {
//     currentZLevel -= 1;
//     console.log(`New Z-level: ${currentZLevel}`);
//     renderer.renderChunk(chunkData, currentZLevel);
//   });
// });
