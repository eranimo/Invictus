import EntityManager from './entityManager';
import Game from './game';
import { loaders } from 'pixi.js';
import createPrefabs, { Prefabs } from './prefabs';
import System from './system';
import * as COMPONENTS from '../components';
import { Constructable } from './types';
import GameGridSystem from './systems/gameGrid';


export enum SceneState {
  LOADING, // initial state
  READY, // ready to start
  INACTIVE, // not being ran
  ACTIVE, // being ran
}

interface EntityData {
  type: string;
  props: { [propName: string]: any };
}

interface SceneData {
  entities: EntityData[];
}

interface ResourceItem {
  name: string;
  url: string;
  data?: loaders.Resource;
};

export default abstract class Scene {
  game: Game;
  name: string;
  state: SceneState;
  entityManager: EntityManager;
  loader: loaders.Loader;
  resources: Map<string, ResourceItem>;
  loadPromise: Promise<void>;
  prefabs: Prefabs;
  systems: System[];
  systemMap: { [systemName: string]: System };

  constructor(game: Game, name: string) {
    this.game = game;
    this.name = name;
    this.entityManager = new EntityManager();
    for (const [name, component] of Object.entries(COMPONENTS)) {
      this.entityManager.registerComponent<any>(name, component);
    }
    this.loader = new loaders.Loader();
    this.resources = new Map();
    this.state = SceneState.LOADING;
    this.init().then(this.onResourcesLoaded.bind(this));
    this.prefabs = createPrefabs(this.entityManager);
    this.systems = [];
    this.systemMap = {};


    // default stuff
    this.addSystem(GameGridSystem, {
      width: 30,
      height: 30,
    });
  }

  async init() {}

  private onResourcesLoaded() {
    for (const item of this.resources.values()) {
      this.loader.add(item.name, item.url);
    }
    this.loadPromise = new Promise((resolve, reject) => {
      this.loader.load((loader, resources) => {
        for (const item of this.resources.values()) {
          item.data = resources[item.name];
          this.resources.set(item.name, item);
        }
        this.setReady();
        resolve();
      });
      this.loader.onError.add(reject);
    });
  }

  addResource(name: string, url: string): ResourceItem {
    const item: ResourceItem = { name, url };
    this.resources.set(name, item);
    return item;
  }

  setActive() {
    this.state = SceneState.ACTIVE;
    this.onStart();
  }

  setInactive() {
    this.state = SceneState.INACTIVE;
    this.onStop();
  }

  setReady() {
    this.state = SceneState.READY;
    this.onReady();
  }

  addSystem(systemClass: Constructable<System>, options: any) {
    const system = new systemClass(this, this.entityManager);
    this.systems.push(system);
    this.systemMap[(systemClass as any).systemName] = system;
    system.init(options);
  }

  public onReady () {}
  public onStart() {}
  public onStop() {}
}
