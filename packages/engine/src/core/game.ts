import EntityManager from './entityManager';
import Scene from './scene';
import { Constructable } from './types';
import MainLoop from './mainLoop';
import TileRenderer from './tileRenderer';
import GameGrid from './gameGrid';
import InputManager from './inputManager';
import System from './system';
import Entity from './entity';
import EntityAttribute from './entityAttribute';
import EntityBehavior from './entityBehavior';


export default class Game extends MainLoop {
  scenes: Map<string, Scene>;
  activeScene: Scene;
  tileRenderer: TileRenderer;
  gameGrid: GameGrid;
  input: InputManager;
  systems: Map<string, System>;

  constructor() {
    super();
    this.input = new InputManager();
    this.scenes = new Map();
    this.systems = new Map();
    this.activeScene = null;
    this.gameGrid = new GameGrid({
      width: 30,
      height: 30,
    }, this);
    this.tileRenderer = new TileRenderer(this);
  }

  createSystem(
    name: string,
    requiredAttributes: Constructable<EntityAttribute>[] = [],
    requiredBehaviors: Constructable<EntityBehavior>[] = [],
  ) {
    const system = new System(requiredAttributes, requiredBehaviors)
    this.systems.set(name, system);
    return system;
  }

  onEntityAdded = (entity: Entity) => {
    for (const system of this.systems.values()) {
      if (system.isValid(entity)) {
        system.addEntity(entity);
      }
    }
  }

  onEntityRemoved = (entity: Entity) => {
    for (const system of this.systems.values()) {
      system.removeEntity(entity);
    }
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
    for (const system of this.systems.values()) {
      system.clear();
    }
    this.input.reset(name);
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
