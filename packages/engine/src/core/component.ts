import { BehaviorSubject, Subscription } from 'rxjs';


export default class Component<T> {
  private value: T | null;
  public value$: BehaviorSubject<T>;

  static defaultValue = {};

  constructor(initialValue: T = null) {
    this.value = initialValue || new.target.defaultValue as T;
    this.value$ = new BehaviorSubject(this.value);
    this.onChange();
  }

  set<K extends keyof T>(key: K, value: T[K]) {
    this.value[key] = value;
    this.value$.next(this.value);
    this.onChange();
  }

  get<K extends keyof T>(key: K) {
    return this.value[key];
  }

  subscribe(
    next?: (value: T) => void, error?: (error: any) => void, complete?: () => void
  ): Subscription {
    return this.value$.subscribe(next, error, complete);
  }

  onChange() {}
}
