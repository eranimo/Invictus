import './style.scss';
import {
  Game,
  Scene,
  Tileset,
  Entity,
  EntityAttribute,
  EntityBehavior,
  Tilemap,
  GameGrid
} from '@invictus/engine';
import { GridPositionAttribute, GridInputBehavior } from '@invictus/engine/components/grid';
import { TileAttribute } from '@invictus/engine/components/tile';
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

    const colonist: Entity = this.entityManager.createEntity([
      [TileAttribute, {
        tileset: 'tileset',
        tileName: 'smile',
        layer: 1,
        colorReplacements: [
          [[255, 255, 255], [231, 121, 129]],
          [[0, 0, 0], [231 - 50, 121 - 100, 129 - 100]],
        ],
        rotation: 0,
      }],
      [GridPositionAttribute, { x: 1, y: 1 }],
    ], [GridInputBehavior]);

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

    this.game.gameGrid.addEntity(terrain);
    this.game.gameGrid.addEntity(colonist);

    // setInterval(() => {
    //   const pos = colonist.getAttribute(GridPositionAttribute);
    //   pos.value = {
    //     x: _.clamp(pos.value.x + _.random(-1, 1), 0, 30),
    //     y: _.clamp(pos.value.y + _.random(-1, 1), 0, 30),
    //   };
    // }, 4000);
  }
}

const game = new Game();
game.loadScene(MainScene, 'main');
game.startScene('main');
game.start();
