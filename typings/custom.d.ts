declare module "*.worker" {
  const content: any;
  export = content;
}

declare module "promise-worker" {
  class PromiseWorker {
    constructor(worker: any)
    postMessage(message: any)
  }
  export default PromiseWorker;
}

declare module "ndarray-fill" {
  const content: any;
  export = content;
}

declare module "ndarray-bits" {
  const content: any;
  export = content;
}

declare module "ndarray-ops" {
  const content: any;
  export = content;
}

declare module "simplex-noise" {
  const content: any;
  export = content;
}

declare module "alea" {
  const content: any;
  export = content;
}

declare module "ngraph.graph" {
  export interface Node {
    id: any;
    data: any;
  }
  export interface Graph {
    addNode(id?: any): Node;
    getLink(left: any, right: any): Node;
    getNode(id?: any): Node;
  }
  type createGraph = () => Graph;
  export default createGraph;
}


declare module "ngraph.generators" {
  import { Graph } from 'ngraph.graph';
  export type grid = (width: number, height: number) => Graph;
}
