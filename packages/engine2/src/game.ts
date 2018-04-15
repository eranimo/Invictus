import EntityManager from './entityManager';
import Scene from './scene';
import { Constructable } from './types';
import MainLoop from './mainLoop';


export default class Game extends MainLoop {
  scenes: Map<string, Scene>;
  activeScene: Scene;

  constructor() {
    super();
    this.scenes = new Map();
    this.activeScene = null;
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
