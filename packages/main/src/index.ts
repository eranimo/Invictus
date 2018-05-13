import {
  Game,
  Scene,
  Tileset,
} from '@invictus/engine';
import { GridPositionComponent } from '@invictus/engine/components';
import { renderUI } from '@invictus/renderer';
import colonistFactory from './entities/colonist';
import './style.scss';


class MainScene extends Scene {
  public tileset: Tileset;

  public async init() {
    this.addResource('tileset', await import('@invictus/renderer/images/tilemap.png'));
  }

  public onStart() {
    console.log('Main Scene: start');
  }

  public onReady() {
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
      },
    }));

    const colonist: number = colonistFactory({
      name: 'Jane',
    }, this.entityManager);

    for (let x = 0; x < 30; x++) {
      for (let y = 0; y < 30; y++) {
        this.prefabs.terrain({
          tile: {
            tileset: 'tileset',
            tileName: 'dots',
            layer: 0,
            colorReplacements: [
              [[255, 255, 255], [100, 100, 100]],
            ],
            rotation: 0,
          },
          position: { x, y },
        });
      }
    }

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
