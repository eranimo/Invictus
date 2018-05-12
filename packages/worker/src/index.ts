import * as isPromise from 'is-promise';


export async function runWorker(worker: any, data: any) {
  const context = new worker();
  return new Promise((resolve, reject) => {
    context.postMessage(data);
    context.addEventListener('message', (result) => {
      resolve(result.data);
    });
  });
}

let messageID: number = 0;
export class PromiseWorker {
  public worker: any;
  public callbacks: {
    [messageID: number]: (error, result) => any,
  };
  constructor(worker) {
    this.worker = worker;
    this.callbacks = {};
    this.worker.addEventListener('message', (event) => {
      this._onMessage(event);
    });
  }
  public _onMessage(event) {
    if (!event.data) {
      return;
    }
    const [id, error, result] = event.data;

    const callback = this.callbacks[id];

    if (!callback) {
      return;
    }

    delete this.callbacks[id];
    callback(error, result);
  }

  public postMessage(data: any, transferrables?: any[]) {
    messageID++;

    return new Promise((resolve, reject) => {
      this.callbacks[messageID] = (error, result) => {
        if (error) {
          const errorObj = new Error(error.message);
          errorObj.stack = error.stack;
          return reject(errorObj);
        }
        resolve(result);
      };
      this.worker.postMessage([messageID, data], transferrables);
    });
  }
}

export function registerPromiseWorker(context: Worker, callback: (message: any) => Promise<any>) {
  function postOutgoingMessage(event, id: number, error?, result?) {
    if (error) {
      context.postMessage([id, {
        message: error.message,
        stack: error.stack,
      }]);
    } else {
      context.postMessage([id, null, result]);
    }

  }
  function handleIncomingMessage(event, id: number, payload) {
    let result;
    try {
      result = {
        res: callback(payload),
      };
    } catch (err) {
      result = { err };
    }

    if (result.err) {
      postOutgoingMessage(event, id, result.err);
    } else if (!isPromise(result.res)) {
      postOutgoingMessage(event, id, null, result.res);
    } else {
      result.res.then(
        (finalResult) => postOutgoingMessage(event, id, null, finalResult),
        (finalError) => postOutgoingMessage(event, id, finalError),
      );
    }
  }
  function onIncomingMessage(event: any) {
    if (!event.data) {
      return;
    }
    const [id, payload] = event.data;
    handleIncomingMessage(event, id, payload);
  }
  context.addEventListener('message', onIncomingMessage);
}
