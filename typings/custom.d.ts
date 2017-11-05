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
