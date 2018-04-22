import EntityManager from './entityManager';
import Entity from './entity';
import Game from './game';
import { loaders } from 'pixi.js';
import createPrefabs, { Prefabs } from './prefabs';


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
  prefabs;

  constructor(game: Game, name: string) {
    this.game = game;
    this.name = name;
    this.entityManager = new EntityManager(this.game.onEntityAdded, this.game.onEntityRemoved);
    this.loader = new loaders.Loader();
    this.resources = new Map();
    this.state = SceneState.LOADING;
    this.init().then(this.onResourcesLoaded.bind(this));
    this.prefabs = createPrefabs(this.entityManager);
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

  public onReady () {}
  public onStart() {}
  public onStop() {}
}
