import Node from './node';
import { loaders } from 'pixi.js';
import Tileset from './tileset';


interface ResourceDef {
  url: string;
  options: any
}
export interface PreloaderProps {
  tilesets: { [name: string]: ResourceDef },
}
export default class Preloader<T extends PreloaderProps> extends Node<T> {
  loader: loaders.Loader;

  static defaultProps = {
    tilesets: [],
  }

  async init() {
    this.loader = new loaders.Loader();
    for (const [name, def] of Object.entries(this.props.tilesets)) {
      this.loader.add(name, def.url);
    }

    await new Promise((resolve, reject) => {
      this.loader.load((loader, resources) => {
        console.log('Loader finished loading');
        for (const [name, res] of Object.entries(resources)) {
          const def = this.props.tilesets[name];
          this.resources[name] = new Tileset(res as any, def.options);
        }
        console.log(this.resources);
        resolve();
      });
      this.loader.onError.add(() => {
        reject();
      });
    });
  }

  onExitTree() {
    this.loader.removeAllListeners();
  }
}
