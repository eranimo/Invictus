import Node from './node';
import { loaders } from 'pixi.js';


export default class Preloader extends Node {
  loader: loaders.Loader;
  resources: {
    [name: string]: loaders.Resource,
  };

  init() {
    this.loader = new loaders.Loader();
    this.resources = {};
  }

  add(name: string, path: any) {
    this.loader.add(name, path);
  }

  async load() {
    return await new Promise((resolve, reject) => {
      this.loader.load((loader, resources) => {
        this.resources = resources;
        resolve();
      });
      this.loader.onError.add(() => {
        reject();
      });
    });
  }
}
