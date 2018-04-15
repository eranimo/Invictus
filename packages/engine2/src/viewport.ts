import { Application, Container, settings } from 'pixi.js';


export default class Viewport {
  app: Application;
  container: Container;

  constructor() {
    this.app = new Application(800, 600, {
      // backgroundColor: this.backgroundColor,
      width: window.innerWidth,
      height: window.innerHeight,
      resolution: window.devicePixelRatio,
      antialias: false,
      roundPixels: false,
    });
    settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
    this.container = new Container();
    document.body.appendChild(this.app.view);
  }
}
