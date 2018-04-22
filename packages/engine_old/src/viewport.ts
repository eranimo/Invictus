import Node from './node';
import { Application, Container, settings } from 'pixi.js';


export interface ViewportProps {
  backgroundColor: number;
}
export default class Viewport<T extends ViewportProps> extends Node<T> {
  app: Application;
  container: Container;

  static defaultProps = {
    backgroundColor: 0x111111,
  };

  async init() {
    console.log();
    this.app = new Application(800, 600, {
      backgroundColor: this.props.backgroundColor,
      width: window.innerWidth,
      height: window.innerHeight,
      resolution: window.devicePixelRatio,
      antialias: false,
      roundPixels: false,
    });
    settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
    this.container = new Container;
  }

  onEnterTree() {
    document.body.appendChild(this.app.view);
  }

  onExitTree() {
    document.body.removeChild(this.app.view);
  }

  render() {
    this.app.renderer.render(this.container);
  }
}
