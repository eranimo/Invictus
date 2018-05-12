export interface IConstructable<T> {
  prototype: T;
  new(...args): T;
}

export interface ICoordinate { x: number; y: number; }
export interface ISize { width: number; height: number; }
export type Rectangle = ICoordinate & ISize;
export type InstanceMap<T> = Map<IConstructable<T>, T>;
