import EntityManager from './entityManager';
import Scene from './scene';
import { Constructable } from './types';
import MainLoop from './mainLoop';
import TileRenderer from './tileRenderer';
import GameGrid from './systems/gameGrid';
import InputManager from './inputManager';
import System from './system';
import { TimeManager } from './time';
import EventEmitter from '@invictus/engine/utils/eventEmitter';


export enum UIEvents {
  CELL_CHANGED,
  CELL_HOVERED,
  CELL_SELECTED,
  CELL_UNSELECTED,
}

export default class Game extends MainLoop {
  scenes: Map<string, Scene>;
  activeScene: Scene;
  tileRenderer: TileRenderer;
  gameGrid: GameGrid;
  input: InputManager;
  systems: Map<string, System>;
  ticks: number;
  time: TimeManager;
  ui: EventEmitter<UIEvents>;

  constructor() {
    super();
    this.input = new InputManager();
    this.scenes = new Map();
    this.systems = new Map();
    this.activeScene = null;
    this.ticks = 0;
    this.tileRenderer = new TileRenderer(this);
    this.time = new TimeManager(this);
    this.ui = new EventEmitter();
  }

  loadScene(sceneClass: Constructable<Scene>, name: string) {
    const scene: Scene = new sceneClass(this, name);
    this.scenes.set(name, scene);
  }

  startScene(name: string) {
    const scene = this.scenes.get(name);
    if (!scene) {
      throw new Error(`Scene '${name}' not found`);
    }
    this.activeScene = scene;
    scene.setActive();
    if (this.activeScene) {
      this.activeScene.setInactive();
    }
    this.input.reset(name);
  }

  stopScene() {
    this.activeScene.setInactive();
  }

  process(elapsedTime: number) {
    this.ticks++;
    this.time.process();
    for (const scene of this.scenes.values()) {
      scene.systems.forEach((system: System) => system.process(elapsedTime));
    }
  }
}
