// classes
export { default as MainLoop } from './mainLoop';
export { default as SceneTree } from './sceneTree';
export { default as Node } from './node';
export { default as Node2D } from './node2D';
export { default as Preloader } from './preloader';
export { default as Tilemap } from './tilemap';
export { default as Viewport } from './viewport';
export { default as TileSet } from './tileset';
export { default as Tile } from './tile';
export { default as IBehavior } from './behavior';


export const TYPE_MAP = {
  Node2D: (require('./node2D') as any).default,
  Preloader: (require('./preloader') as any).default,
  Tilemap: (require('./tilemap') as any).default,
  Tile: (require('./tile') as any).default,
  Viewport: (require('./viewport') as any).default,
};


export async function importScene(scene, def) {
  scene.stop();
  const root = scene.import(JSON.parse(def), type => TYPE_MAP[type]);
  await scene.changeScene(root);
  scene.start();
}
