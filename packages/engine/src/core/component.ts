import { BehaviorSubject, Subscription } from 'rxjs';

export default class Component<T> {
  public static defaultValue = {};

  public value: T | null;
  public value$: BehaviorSubject<T>;

  constructor(initialValue: T = null) {
    this.value = initialValue || new.target.defaultValue as T;
    this.value$ = new BehaviorSubject(this.value);
    this.onChange();
  }

  public set<K extends keyof T>(key: K, value: T[K]) {
    this.value[key] = value;
    this.value$.next(this.value);
    this.onChange();
  }

  public get<K extends keyof T>(key: K) {
    return this.value[key];
  }

  public subscribe(
    next?: (value: T) => void, error?: (error: any) => void, complete?: () => void,
  ): Subscription {
    return this.value$.subscribe(next, error, complete);
  }

  public onChange() {
    // not implemented
  }
}
