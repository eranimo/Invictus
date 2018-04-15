import './style.scss';
import {
  Game,
  Scene,
  Tileset,
  Entity,
  EntityAttribute,
  EntityBehavior
} from '@invictus/engine2';
// import { Sprite } from 'pixi.js';


class MainScene extends Scene {
  tileset: Tileset;

  async init() {
    this.addResource('tileset', await import('@invictus/renderer/images/tilemap.png'));
  }

  onStart() {
    console.log('Main Scene: start');
  }

  onReady() {
    console.log('Main Scene: ready');
    console.log('resources', this.resources);
    const tilesetRes = this.resources.get('tileset').data;
    this.tileset = new Tileset(tilesetRes, {
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
    });

    const tile = this.prefabs.tile({
      tileset: 'tileset',
      tileName: 'smile',
      colorReplacements: [
        [[255, 255, 255], [231, 121, 129]],
      ],
    });
    console.log(tile);
  }
}

const game = new Game();
game.loadScene(MainScene, 'main');
game.startScene('main');
game.start();
