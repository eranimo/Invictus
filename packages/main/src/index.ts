import './style.scss';
import {
  Game,
  Scene,
  Tileset,
  Entity,
  EntityAttribute,
  EntityBehavior,
  Tilemap,
} from '@invictus/engine2';
import { PositionAttribute } from '@invictus/engine2/prefabs/tile';
// import { Sprite } from 'pixi.js';
import _ from 'lodash';


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

    const colonist: Entity = this.prefabs.tile({
      tileset: 'tileset',
      tileName: 'smile',
      colorReplacements: [
        [[255, 255, 255], [231, 121, 129]],
        [[0, 0, 0], [231-50, 121-100, 129-100]],
      ],
      rotation: 0,
    });
    colonist.addAttribute(PositionAttribute, { x: 1, y: 1 });

    const tilemap = new Tilemap({
      width: 30,
      height: 30,
      tileset: this.tileset,
    });
    tilemap.addEntity(colonist);

    setInterval(() => {
      const pos = colonist.getAttribute(PositionAttribute);
      pos.value = {
        x: _.clamp(pos.value.x + _.random(-1, 1), 0, 30),
        y: _.clamp(pos.value.y + _.random(-1, 1), 0, 30),
      };
    }, 4000)
    tilemap.attachTo(this.game.viewport);
    console.log(colonist);
    console.log('Tileset', this.tileset);
    console.log('Game', this.game);
  }
}

const game = new Game();
game.loadScene(MainScene, 'main');
game.startScene('main');
game.start();
