import { mapValues, isEqual, every } from 'lodash';
import SceneTree from './sceneTree';
import { loaders } from 'pixi.js';
import IBehavior from './behavior';


type AnyJson = boolean | number | string | null | JsonArray | JsonMap;
interface JsonMap { [key: string]: AnyJson; }
interface JsonArray extends Array<AnyJson> { }

export interface NodeDef<T> {
  type: string;
  name: string;
  props: T,
  children?: NodeDef<T>[],
}

export default class Node<T extends object> {
  name: string;
  props: T;
  childrenSet: Set<Node<T>>;
  children: { [childName: string]: Node<T> };
  parent: Node<T>;
  tree: SceneTree | null;
  resources: {
    [name: string]: any
  };
  readyPromise: Promise<any>;
  behavior: IBehavior;

  static defaultProps = {};

  /** Creates a new Node */
  constructor(name: string, props?: T, behavior?: IBehavior) {
    if (name === 'root') {
      throw new Error('Node name can not be \'root\'');
    }
    if (typeof name !== 'string' || name.length === 0) {
      throw new Error(`Invalid Node name '${name}'`);
    }
    this.name = name;
    this.props = Object.assign({}, new.target.defaultProps || {}, props);
    this.childrenSet = new Set();
    this.children = {};
    this.tree = null;
    this.parent = null;
    this.resources = {};
    this.behavior = behavior;
  }

  async init() {}

  /** Called on every processing frame */
  process(
    /** Time in ms since last process step */
    elapsedTime: number
  ) {
    if (this.behavior && this.behavior.process) this.behavior.process.call(this, elapsedTime);
  }

  /** Called on every render frame */
  render(
    /** Time in ms since last render step */
    elapsedTime: number
  ) {
    if (this.behavior && this.behavior.render) this.behavior.render.call(this, elapsedTime);
  }

  // scene 

  get isInsideTree() {
    return !!this.tree;
  }
  
  /** Called when Node enters a SceneTree */
  onEnterTree() {
    if (this.behavior && this.behavior.enter) this.behavior.enter.call(this);
  }

  /** Called when Node exits a SceneTree */
  onExitTree() {
    if (this.behavior && this.behavior.exit) this.behavior.exit();
  }

  /** Called when all of Node's children have entered a SceneTree */
  onReady() {
    if (this.behavior && this.behavior.ready) this.behavior.ready();
  }

  get type() {
    return this.constructor.name;
  }

  /** 
   * Gets a Node relative to this node
   * if they are in the same SceneTree
   * 
   * EG:
   *     /root (get root node)
   *     foobar (get sibiling node foobar)
   *     foobar/barbaz (get nibling node "barbaz", a child of a sibling node)
   *     /root/foobar (get foobar via absolute path)
   * */
  getNode(path: string): any | null {
    if (path.startsWith('/root/') && this.tree === null) {
      throw new Error('Cannot get absolute path when Node is not inside a SceneTree');
    }
    const [pathPart, resourcePart] = path.split(':');
    let pathList = pathPart.split('/');

    let isAbsolute = pathList[0] === '' && pathList[1] === 'root';
    if (isAbsolute) {
      pathList.shift();
      pathList.shift();
    }
    let currentNode = isAbsolute ? this.tree.currentScene : this;

    pathList = pathList.filter(item => {
      if (item === '..') {
        currentNode = currentNode.parent;
        return false;
      }
      return true;
    })
    if (pathList.length === 0) return currentNode;

    let i = 0;
    let found;
    const search = (n1) => {
      n1.forEachChildInTree(n2 => {
        if (n2.name === pathList[0]) {
          pathList.shift();
          if (pathList.length === 0) {
            found = n2;
          }
        }
      })
    }
    search(currentNode);
    if (found) {
      if (resourcePart) {
        return found.resources[resourcePart];
      }
      return found;
    }
    return null;
  }

  get isRoot(): boolean {
    if (this.tree === null) return false;
    return this.tree.currentScene == this;
  }

  getPath(): string {
    if (this.tree === null) return null;

    const pathList = [this.isRoot ? '/root' : this.name];
    
    this.forEachParent(parent => {
      pathList.push(parent.isRoot ? '/root' : parent.name);
    });
    pathList.reverse();

    return pathList.join('/');
  }

  getChild(childName: string): Node<T> {
    return this.children[childName];
  }

  getParentOfType(type: string): Node<T> {
    let current: Node<T> = this.parent;
    while (current !== null) {
      if (current.type === type) {
        return current;
      }
      current = current.parent;
    }
    return null;
  }

  /**
   * Gets the relative path string to a node
   * @param node Node to find path to
   */
  getPathTo(node: Node<T>) {
    // if not part of the same tree, return null
    if (node.tree != this.tree) {
      return null;
    }
  }

  // looping over nodes
  forEachParent(func: (child: Node<T>) => void) {
    if (this.parent) {
      func(this.parent);
      this.parent.forEachParent(func);
    }
  }

  forEachChild(func: (child: Node<T>) => void) {
    if (this.childCount === 0) return;

    this.childrenSet.forEach(func);
  }

  /**
   * Depth-first loop
   * @param func Function to run on each child in the tree
   */
  forEachChildInTree(func: (child: Node<T>) => void) {
    if (this.childCount === 0) return;

    this.childrenSet.forEach(child => {
      func(child);
      child.forEachChildInTree(func);
    });
  }

  // basic node operations

  addChild(child: Node<any>) {
    if (this.childrenSet.has(child)) {
      throw new Error('Node instance is already a child of this node');
    }
    if (child.name in this.children) {
      throw new Error(`Node already has a child named '${child.name}'`);
    }
    if (child == this) {
      throw new Error('Cannot add self as a child');
    }
    this.childrenSet.add(child);
    this.children[child.name] = child;
    child.parent = this;

    // notify tree of new node
    if (this.tree) {
      child.tree = this.tree;
      this.tree._notifySceneEnter(child);
      this.tree.onNodeAdded(child);
    }
  }

  addChildFromBehavior(
    name: string,
    props?: any,
    behavior?: IBehavior
  ): Node<any> {
    const node = new Node(name, props, behavior);
    this.addChild(node);
    return node;
  }

  hasChild(child: Node<any>) {
    return this.childrenSet.has(child);
  }

  removeChild(child: Node<any>) {
    this.childrenSet.delete(child);
    delete this.children[child.name];
    child.parent = null;

    // notify tree of node removal
    if (this.tree) {
      this.tree.onNodeRemoved(child);
    }
  }

  get childCount(): number {
    return this.childrenSet.size;
  }

  // equality

  isEqual(node: Node<any>) {
    return (
      this.type === node.type &&
      this.name === node.name &&
      isEqual(this.props, node.props)
    );
  }

  isEqualTree(node: Node<any>) {
    return isEqual(this.exportTree(), node.exportTree());
  }

  // exporting

  export(): NodeDef<T> {
    return {
      type: this.type,
      name: this.name,
      props: this.props
    };
  }

  exportTree(): NodeDef<T> {
    const def: NodeDef<T> = this.export();

    if (this.childCount > 0) {
      def.children = [];
      for (const child of this.childrenSet) {
        def.children.push(child.exportTree());
      }
    }

    return def;
  }

  exportTreeJSON() {
    return JSON.stringify(this.exportTree());
  }
}
