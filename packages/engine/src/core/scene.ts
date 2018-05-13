import { loaders } from 'pixi.js';
import * as COMPONENTS from '../components';
import EntityManager from './entityManager';
import Game from './game';
import { GridUI } from './gridUI';
import createPrefabs, { IPrefabs } from './prefabs';
import { System } from './system';
import { GameGridSystem } from './systems/gameGrid';
import TilemapSystem from './systems/tilemap';
import { IConstructable } from './types';


export enum SceneState {
  LOADING, // initial state
  READY, // ready to start
  INACTIVE, // not being ran
  ACTIVE, // being ran
}

interface IResourceItem {
  name: string;
  url: string;
  data?: loaders.Resource;
}

interface IGameMap {
  width: 30;
  height: 30;
}

export default abstract class Scene {
  public game: Game;
  public name: string;
  public state: SceneState;
  public entityManager: EntityManager;
  public loader: loaders.Loader;
  public resources: Map<string, IResourceItem>;
  public loadPromise: Promise<void>;
  public prefabs: IPrefabs;

  public systems: System[];
  public systemMap: { [systemName: string]: any };
  public gameMap: IGameMap;
  public gridUI: GridUI;

  constructor(game: Game, name: string) {
    this.game = game;
    this.name = name;
    this.entityManager = new EntityManager();
    for (const [cname, component] of Object.entries(COMPONENTS)) {
      this.entityManager.registerComponent<any>(cname, component);
    }
    this.loader = new loaders.Loader();
    this.resources = new Map();
    this.state = SceneState.LOADING;
    this.init().then(this.onResourcesLoaded.bind(this));
    this.prefabs = createPrefabs(this.entityManager);
    this.systems = [];
    this.systemMap = {};

    this.gameMap = {
      width: 30,
      height: 30,
    };

    // default stuff
    this.addSystem<GameGridSystem>(GameGridSystem, {
      width: this.gameMap.width,
      height: this.gameMap.height,
    });
    this.addSystem<TilemapSystem>(TilemapSystem, {
      width: this.gameMap.width,
      height: this.gameMap.height,
      tileWidth: 16,
      tileHeight: 16,
      layers: 2,
    });

    this.gridUI = new GridUI(this, {
      width: this.gameMap.width,
      height: this.gameMap.height,
      tileWidth: 16,
      tileHeight: 16,
    });
  }

  public async init() {}

  public addResource(name: string, url: string): IResourceItem {
    const item: IResourceItem = { name, url };
    this.resources.set(name, item);
    return item;
  }

  public setActive() {
    this.state = SceneState.ACTIVE;
    this.onStart();
  }

  public setInactive() {
    this.state = SceneState.INACTIVE;
    this.onStop();
  }

  public setReady() {
    this.state = SceneState.READY;
    this.onReady();
  }

  public addSystem<T extends System>(systemClass: IConstructable<T>, options: any) {
    const system = new systemClass(this, this.entityManager);
    this.systems.push(system);
    this.systemMap[(systemClass as any).systemName] = system;
    system.init(options);
  }

  public onReady() {}
  public onStart() {}
  public onStop() {}

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
}
