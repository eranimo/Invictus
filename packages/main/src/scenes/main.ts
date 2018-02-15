import { Scene } from '@invictus/engine';
import tilemapSystem from '../systems/tilemap';


export default class MainScene extends Scene {
  resources: any;

  get renderSystems() {
    return [
      tilemapSystem
    ]
  }

  async onInit() {
    const tilemapImg = await import('@invictus/renderer/images/tilemap.png');
    PIXI.loader.add('tilemap', tilemapImg);
    await new Promise(resolve => PIXI.loader.load((loader, resources) => {
      this.resources = resources;
      resolve();
    }));
  }

  onEnter() {
    console.log('Main scene: enter');

    const tileID = this.entities.create();
    const tile = this.entities.addComponent(tileID, 'tile');
    tile.tileID = 1;

    const position = this.entities.addComponent(tileID, 'position');
    position.x = 5;
    position.y = 5;
  }

  onStop() {
    console.log('Main scene: stop');
  }

  onExit() {
    console.log('Main scene: exit');
  }
}
