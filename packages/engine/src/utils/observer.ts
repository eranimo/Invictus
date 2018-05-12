/** A  */
export interface IObserver<T> {
  onNotify(object: T, data: any): void;
}

export class Subject<T> {
  public observers: Set<IObserver<T>>;

  constructor() {
    this.observers = new Set();
  }

  public addObserver(observer: IObserver<T>) {
    this.observers.add(observer);
  }

  public removeObserver(observer: IObserver<T>) {
    this.observers.delete(observer);
  }

  public isObserving(observer: IObserver<T>): boolean {
    return this.observers.has(observer);
  }

  /** Notify each observer of  */
  public notify(object: T, data: any) {
    for (const observer of this.observers) {
      observer.onNotify(object, data);
    }
  }
}
