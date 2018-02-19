// import Renderer from '@invictus/renderer';
// import MapGenerator from '@invictus/generator';
import './style.scss';
// import * as KeyboardJS from 'keyboardjs';
import { clamp, random } from 'lodash';
import { SceneTree, Node, Tilemap, Viewport, Preloader, TileSet, Tile } from '@invictus/engine';
import Vector2D from 'victor';


// class Colonist extends Node<any> {
//   onEnterTree() {
//     this.addChild();
//   }
// }


let colonistID = 1;
function makeColonist(parent: Node<any>) {
  const colonist = new Node(`colonist-${colonistID}`);
  colonistID++;

  parent.addChild(colonist);
}

/*

- Viewport
  - Preloader
  - Tilemap
    - Tile

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
  tileset.createTile(15, 'dots');

  const tilemap = new Tilemap('tilemap', {
    position: new Vector2D(0, 0),
    width: 50,
    height: 50,
    cellSize: 16
  });
  tilemap.tileset = tileset;

  tilemap.setCell(new Vector2D(5, 5), 'smile')

  root.addChild(tilemap);

  let tileID = 1;
  function newTile(tileID, x, y) {
    const tile = new Tile(`tile-${tileID}`, {
      tileID,
      position: new Vector2D(x, y),
      colorReplacements: [
        [[255 / 255, 255 / 255, 255 / 255], [231 / 255, 121 / 255, 129 / 255]],
      ]
    });
    tilemap.addChild(tile);
    tileID++;
    return tile;
  }

  const tile = newTile('smile', 5, 5);
  setInterval(() => {
    tile.changePosition(new Vector2D(random(-1, 1), random(-1, 1)));
  }, 1500);

  await scene.changeScene(root);
  console.log('preloader resources', preloader.resources);
  scene.start();

  (window as any).scene = scene;
  (window as any).exportMap = () => {
    console.log(scene.currentScene.exportTreeJSON());
  }
  (window as any).importMap = (desc) => {
    const root = Node.import(desc);
    scene.changeScene(root);
  }
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
