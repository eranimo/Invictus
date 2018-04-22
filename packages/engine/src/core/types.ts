export interface Constructable<T> {
  new(...args): T;
  prototype: T
}

export type Coordinate = { x: number, y: number };
export type Size = { width: number, height: number };
export type Rectangle = Coordinate & Size;
export type InstanceMap<T> = Map<Constructable<T>, T>;
