// import Renderer from '@invictus/renderer';
// import MapGenerator from '@invictus/generator';
import './style.scss';
// import * as KeyboardJS from 'keyboardjs';
import { clamp } from 'lodash';
import { SceneTree, Node, Tilemap, Viewport, Preloader, TileSet } from '@invictus/engine';


let colonistID = 1;
function Colonist(parent: Node<any>) {
  const colonist = new Node(`colonist-${colonistID}`);
  colonistID++;

  parent.addChild(colonist);
}

/*

- Viewport
  - Preloader
  - Tilemap
    - colonist: Node
      - 

*/
async function setup() {
  const scene = new SceneTree();
  const root = new Viewport('viewport');

  // preload things
  const preloader = new Preloader('preloader');
  preloader.add('tilemap', await import('@invictus/renderer/images/tilemap.png'));
  await preloader.load();
  root.addChild(preloader);

  const tileset = new TileSet(preloader.resources.tilemap, {
    tileWidth: 16,
    tileHeight: 16,
  });
  tileset.createTile(45, 'smile');

  const tilemap = new Tilemap('tilemap', { width: 50, height: 50, cellSize: 16 });
  tilemap.tileset = tileset;

  tilemap.setCell(5, 5, 'smile')
  root.addChild(tilemap);

  await scene.changeScene(root);
  console.log('preloader resources', preloader.resources);
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
