export type EventCallback = (...args) => void;

export default class EventEmitter<T = string> {
  callbacks: Map<T, EventCallback[]>;

  constructor() {
    this.callbacks = new Map();
  }

  on(eventName: T, callback: EventCallback) {
    this.callbacks.has(eventName) || this.callbacks.set(eventName, []);
    this.callbacks.get(eventName).push(callback);
  }

  off(eventName: T, callback: EventCallback) {
    throw new Error('Not implemented yet');
  }

  emit(eventName: T, ...args): boolean {
    const callbacks = this.callbacks.get(eventName);
    if (callbacks && callbacks.length > 0) {
      callbacks.forEach(cb => cb(...args));
      return true;
    }
    return false;
  }
}
