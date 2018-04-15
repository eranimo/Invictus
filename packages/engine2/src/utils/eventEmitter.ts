export type EventCallback = (...args) => void;

export default class EventEmitter {
  callbacks: Map<string, EventCallback[]>;

  constructor() {
    this.callbacks = new Map();
  }

  on(eventName: string, callback: EventCallback) {
    this.callbacks.has(eventName) || this.callbacks.set(eventName, []);
    this.callbacks.get(eventName).push(callback);
  }

  off(eventName: string, callback: EventCallback) {
    throw new Error('Not implemented yet');
  }

  emit(eventName: string, ...args): boolean {
    const callbacks = this.callbacks.get(eventName);
    if (callbacks && callbacks.length > 0) {
      callbacks.forEach(cb => cb(...args));
      return true;
    }
    return false;
  }
}
