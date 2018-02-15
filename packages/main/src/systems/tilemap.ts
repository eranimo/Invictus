import { EntityComponentSystem } from 'entity-component-system';
import Game from '@invictus/engine/game';
import TileMapGrid from '@invictus/main/tilemapGrid';
import { createTileTexture } from '@invictus/renderer/scene';


const CELL_WIDTH = 50;
const CELL_HEIGHT = 50;
const CELL_SIZE = 10;

export default function tilemapSystem(ecs: EntityComponentSystem, game: Game) {
  console.log('System - tilemap');

  const app = new PIXI.Application(800, 600, {
    backgroundColor: 0x111111,
    width: CELL_WIDTH * CELL_SIZE,
    height: CELL_HEIGHT * CELL_SIZE,
    resolution: window.devicePixelRatio,
    antialias: false,
    roundPixels: false,
  });
  PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
  document.body.appendChild(app.view);

  const grid = new TileMapGrid(app, CELL_WIDTH, CELL_HEIGHT, CELL_SIZE);

  // @ts-ignore
  // const hashtag = createTileTexture(this.game.activeScene.resources.tilemap);

  game.activeScene.entities.registerSearch('gridTile', ['tile', 'position']);

  game.activeScene.entities.onAddComponent('tile', (entity, comp, value) => {
    console.log('tile added', value);
  });

  grid.render();
  
  const positions = {};
  const tiles = {};

  game.activeScene.renderer.addEach(entityID => {
    const pos = game.activeScene.entities.getComponent(entityID, 'position');
    const tile = game.activeScene.entities.getComponent(entityID, 'tile');

    let posChanged = false;
    if (!pos[entityID] || pos[entityID].x !== pos.x || pos[entityID].y !== pos.y) {
      pos[entityID] = pos;
      posChanged = true;
    }

    let tileChanged = false;
    if (!tile[entityID] || tile[entityID].tileID !== tile.tileID) {
      tile[entityID] = tile;
      tileChanged = true;
    }

    if (tileChanged || posChanged) {
      console.log('update tile');
      // grid.setTileTexture(pos.x, pos.y, this.);
    }
  }, 'gridTile');
}
