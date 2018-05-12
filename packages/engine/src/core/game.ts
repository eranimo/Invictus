import EventEmitter from '@invictus/engine/utils/eventEmitter';
import InputManager from './inputManager';
import MainLoop from './mainLoop';
import Scene from './scene';
import TileRenderer from './tileRenderer';
import { TimeManager } from './time';
import { IConstructable } from './types';

export enum UIEvents {
  CELL_CHANGED,
  CELL_HOVERED,
  CELL_SELECTED,
  CELL_UNSELECTED,
}

export default class Game extends MainLoop {
  public scenes: Map<string, Scene>;
  public activeScene: Scene;
  public tileRenderer: TileRenderer;
  public input: InputManager;
  public ticks: number;
  public time: TimeManager;
  public ui: EventEmitter<UIEvents>;

  constructor() {
    super();
    this.input = new InputManager();
    this.scenes = new Map();
    this.activeScene = null;
    this.ticks = 0;
    this.tileRenderer = new TileRenderer(this);
    this.time = new TimeManager(this);
    this.ui = new EventEmitter();
  }

  public loadScene(sceneClass: IConstructable<Scene>, name: string) {
    const scene: Scene = new sceneClass(this, name);
    this.scenes.set(name, scene);
  }

  public startScene(name: string) {
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

  public stopScene() {
    this.activeScene.setInactive();
  }

  public process(elapsedTime: number) {
    this.ticks++;
    this.time.process();
  }
}
