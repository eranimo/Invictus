export type EventCallback = (...args) => void;

export default class EventEmitter<T = string> {
  public callbacks: Map<T, EventCallback[]>;

  constructor() {
    this.callbacks = new Map();
  }

  public on(eventName: T, callback: EventCallback) {
    if (!this.callbacks.has(eventName)) {
      this.callbacks.set(eventName, []);
    }
    this.callbacks.get(eventName).push(callback);
  }

  public off(eventName: T, callback: EventCallback) {
    throw new Error('Not implemented yet');
  }

  public emit(eventName: T, ...args): boolean {
    const callbacks = this.callbacks.get(eventName);
    if (callbacks && callbacks.length > 0) {
      callbacks.forEach((cb) => cb(...args));
      return true;
    }
    return false;
  }
}
