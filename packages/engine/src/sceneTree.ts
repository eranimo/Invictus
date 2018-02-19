import Node from './Node';
import MainLoop from './mainLoop';


/**
 * SceneTree
 * 
 * A container for a node tree
 * - creates and manages node groups
 * - calls node tree events
 */
export default class SceneTree extends MainLoop {
  currentScene: Node<any>;

  constructor() {
    super();
    this.currentScene = null;
  }

  /** Called on every processing frame */
  process(
    /** Time in ms since last process step */
    elapsedTime: number
  ) {
    if (!this.currentScene ) {
      throw new Error('SceneTree needs a root node to run');
    }
    this.forEachNode(node => node.process(elapsedTime));
  }

  /** Called on every render frame */
  render(
    /** Time in ms since last render step */
    elapsedTime: number
  ) {
    if (!this.currentScene) {
      throw new Error('SceneTree needs a root node to run');
    }
    this.forEachNode(node => node.render(elapsedTime));
  }

  forEachNode(func: (node: Node<any>) => void) {
    func(this.currentScene);
    this.currentScene.forEachChildInTree(func);
  }

  _notifySceneExit(node: Node<any>) {
    node.onExitTree();
    node.tree = null;
    node.forEachChildInTree(this._notifySceneExit.bind(this));
  }

  async _notifySceneEnter(node: Node<any>) {
    node.tree = this;
    await node.onEnterTree();
    let promises = [];
    node.forEachChildInTree((child => {
      promises.push(this._notifySceneEnter(child));
    }));
    await Promise.all(promises);
    node.onReady();
  }

  async changeScene(node: Node<any>) {
    if (this.currentScene) {
      this._notifySceneExit(this.currentScene);
    }
    this.currentScene = node;

    try {
      await this._notifySceneEnter(node);
    } catch (err) {
      console.warn('Error initializing scene tree');
      console.error(err);
    }
  }

  // events
  onNodeAdded(node: Node<any>) {}
  onNodeRemoved(node: Node<any>) {}
}
