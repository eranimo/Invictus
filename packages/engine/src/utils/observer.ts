/** A  */
export interface Observer<T> {
  onNotify(object: T, data: any): void
}

export class Subject<T> {
  observers: Set<Observer<T>>;

  constructor() {
    this.observers = new Set();
  }

  addObserver(observer: Observer<T>) {
    this.observers.add(observer);
  }

  removeObserver(observer: Observer<T>) {
    this.observers.delete(observer);
  }

  isObserving(observer: Observer<T>): boolean {
    return this.observers.has(observer);
  }

  /** Notify each observer of  */
  notify(object: T, data: any) {
    for (const observer of this.observers) {
      observer.onNotify(object, data);
    }
  }
}
