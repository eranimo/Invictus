import './style.scss';
import {
  Game,
  Scene,
  Tileset,
} from '@invictus/engine';
import { GridPositionComponent } from '@invictus/engine/components';
import _ from 'lodash';
import colonistFactory from './entities/colonist';
import { renderUI } from '@invictus/renderer';


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
    this.game.tileRenderer.addTileset('tileset', new Tileset(tilesetRes, {
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
    }));

    const colonist: number = colonistFactory({
      name: 'Jane'
    }, this.entityManager);

    const terrain = this.prefabs.terrain({
      tile: {
        tileset: 'tileset',
        tileName: 'dots',
        layer: 0,
        colorReplacements: [
          [[255, 255, 255], [100, 100, 100]],
        ],
        rotation: 0,
      },
      position: { x: 1, y: 1 },
    });


    setInterval(() => {
      const pos = this.entityManager.getComponent<GridPositionComponent>(colonist, 'GridPositionComponent');
      if (pos.get('x') < 20) {
        pos.set('x', pos.get('x') + 1);
      }
    }, 1000);
  }
}

const game = new Game();
renderUI(game.ui);
game.loadScene(MainScene, 'main');
game.startScene('main');
game.start();
