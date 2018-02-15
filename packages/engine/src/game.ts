import { EntityComponentSystem, EntityPool } from 'entity-component-system';
import * as systems from './systems';
import Scene from './scene';

import Prefabs from './prefabs';

export type Globals = {
  prefabs: Prefabs,
}
export type System = (ecs: EntityComponentSystem, game: Game) => void;

export interface Component<DataInterface> {
  /** Function to create component */
  factory(): DataInterface;

  /** Function to reset component */
  reset(data: DataInterface): void;
}

interface GameOptions {
  debug: boolean,
};
const defaultOptions = {
  debug: false,
};

/**
 * Game
 * 
 * - access point for entire system
 * - controls Scenes
 * - access to Pixi Application
 */
export default class Game {
  lastTime: number
  prefabs: Prefabs;
  running: boolean;
  scenes: { [sceneName: string]: Scene };
  options: GameOptions;
  activeScene: Scene;

  constructor(options: GameOptions = defaultOptions) {
    this.lastTime = -1;
    this.scenes = {};
    this.running = false;

    this.prefabs = new Prefabs();
    this.options = options;
  }

  runScene(sceneName: string, options: any) {
    if (this.options.debug) console.log(`Game: run scene ${sceneName}`);
    if (!this.scenes[sceneName]) {
      throw new Error(`Scene ${sceneName} not registered`);
    }
    this.scenes[sceneName].start(options);
    if (this.activeScene) {
      this.activeScene.onExit();
    }
    this.activeScene = this.scenes[sceneName];
  }

  async registerScene(sceneName: string, scene: Scene) {
    if (this.options.debug) console.log(`Game: register scene ${sceneName} (${scene.constructor.name})`);
    this.scenes[sceneName] = scene;
    await scene.onInit();
  }
  
  start() {
    if (this.options.debug) console.log(`Game: start`);
    if (this.running) {
      return;
    }
    this.running = true;
    this.lastTime = -1;
    window.requestAnimationFrame(this.run.bind(this));
  }

  stop() {
    if (this.options.debug) console.log(`Game: stop`);
    if (this.running) {
      this.running = false;
    }
  }

  private run(time) {
    if (this.lastTime === -1) {
      this.lastTime = time;
    }
    var elapsed = time - this.lastTime;
    this.lastTime = time;

    // simulate scenes
    for (const [name, scene] of Object.entries(this.scenes)) {
      scene.simulate(elapsed);
    }

    // render scenes
    for (const [name, scene] of Object.entries(this.scenes)) {
      scene.render(elapsed);
    }

    if (this.running) {
      window.requestAnimationFrame(this.run.bind(this));
    }
  }
}
