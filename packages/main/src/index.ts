// import Renderer from '@invictus/renderer';
// import MapGenerator from '@invictus/generator';
import './style.scss';
// import * as KeyboardJS from 'keyboardjs';
import { clamp, random } from 'lodash';
import {
  SceneTree,
  Node,
  Tilemap,
  Viewport,
  Preloader,
  TileSet,
  Tile,
  importScene,
  IBehavior,
} from '@invictus/engine';
import Vector2D from 'victor';


const ColonistBehavior: IBehavior = {
  enter() {
    this.addChild(new Tile(`${this.name}-tile`, {
      tileID: 'smile',
      position: this.props.location,
      colorReplacements: [
        [[255, 255, 255], [231, 121, 129]],
      ],
    }));
  }
}

const WallBehavior: IBehavior = {
  enter() {
    this.addChild(new Tile(`${this.name}-tile`, {
      tileID: 'wall',
      position: this.props.location,
      colorReplacements: [
        [[255, 0, 0], [56, 90, 145]],
        [[0, 0, 0], [20, 20, 20]],
        [[255, 255, 255], [36, 70, 125]],
      ],
    }));
  }
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
  const preloader = new Preloader('preloader', {
    tilesets: {
      tileset: {
        url: await import('@invictus/renderer/images/tilemap.png'),
        options: {
          tileWidth: 16,
          tileHeight: 16,
          tiles: {
            smile: {
              index: 45,
            },
            dots: {
              index: 15,
            },
            wall: {
              index: 0,
            },
          }
        }
      },
    },
  });
  root.addChild(preloader);


  const tilemap = new Tilemap('tilemap', {
    position: new Vector2D(0, 0),
    width: 50,
    height: 50,
    cellSize: 16,
    tileset: {
      location: '/root/preloader',
      resource: 'tileset',
    },
  });

  root.addChild(tilemap);
  await scene.changeScene(root);

  tilemap.addChildFromBehavior('colonist', {
    location: { x: 10, y: 10 }
  }, ColonistBehavior);

  tilemap.addChildFromBehavior('wall', {
    location: { x: 0, y: 0 }
  }, WallBehavior);


  scene.start();

  (window as any).scene = scene;
  (window as any).exportMap = () => {
    console.log(scene.currentScene.exportTreeJSON());
  }
  (window as any).importMap = (desc) => {
    importScene(scene, desc);
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
