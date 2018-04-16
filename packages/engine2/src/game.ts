import EntityManager from './entityManager';
import Scene from './scene';
import { Constructable } from './types';
import MainLoop from './mainLoop';
import TileRenderer from './tileRenderer';
import GameGrid from './gameGrid';


export default class Game extends MainLoop {
  scenes: Map<string, Scene>;
  activeScene: Scene;
  tileRenderer: TileRenderer;
  gameGrid: GameGrid;

  constructor() {
    super();
    this.scenes = new Map();
    this.activeScene = null;
    this.gameGrid = new GameGrid({
      width: 30,
      height: 30,
    }, this);
    this.tileRenderer = new TileRenderer(this);
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
  }

  stopScene() {
    this.activeScene.setInactive();
  }

  process(elapsedTime: number) {
    for (const scene of this.scenes.values()) {
      scene.entityManager.entities.forEach(entity => {
        entity.behaviors.forEach(behavior => behavior.onUpdate(elapsedTime));
      });
    }
  }

  render(elapsedTime: number) {
    for (const scene of this.scenes.values()) {
      scene.entityManager.entities.forEach(entity => {
        entity.behaviors.forEach(behavior => behavior.onDraw(elapsedTime));
      });
    }
  }
}
