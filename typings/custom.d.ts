declare module "entity-component-system" {
  export type SystemTimings = {
    [systemName: string]: number
  };
  export type GlobalSystem = (entityPool: EntityPool, elapsedTime: number) => void;
  export type System = (entityID: number, elapsedTime: number) => void;

  export class EntityComponentSystem {

    /** Adds a "system" function to the ECS so it will be called once every time run is called. */
    add(system: GlobalSystem): void;

    /** Adds a "system" function to the ECS so it will be called once for each entity
     * returned from EntityPool.find(search) in the EntityPool passed to run. */
    addEach(system: System, search: string): void;
    
    /** Invokes all systems in the order they were added to the EntityComponentSystem */
    run(
      /** the EntityPool instance to run */
      entities: EntityPool,
      /** elapsed time since last run */
      elapsedTime: number
    );

    /** Returns the number of times run was called */
    runs(): number;

    /** Returns an array of each system's name and time it ran in milliseconds */
    timings(): SystemTimings;

    /** Resets the timing information and number of runs back to zero. */
    resetTimings(): void;
  }

  export class EntityPool {
    /** Creates a new entity, and returns the entity's id */
    create(): number;

    /** Removes all the components for an entity, and deletes the entity.
     * The onRemoveComponent callbacks are fired for each component that is removed. */
    destroy(
      /** ID of the entity to remove */
      entityID: number
    ): void;

    /** Registers a component type
     */
    registerComponent(
      /** the name of the component to register */
      component: string,
      /** a factory function which returns a newly allocated instance of the component */
      factory: Function,
      /** an optional function which alters a previously used component instance to a clean state so it can be reused on a new entity */
      reset?: Function,
      /** an optional number of instances to allocate initially */
      size?: number
    ): void;

    /** Adds a new component to an entity, and returns it.
     * If the component is newly added, the onAddComponent callbacks are fired.
     * If the component already existed, it is reset. */
    addComponent(
      /** the id of the entity to add the component to */
      entityID: number,
      /** the name of the component to add */
      component: string
    ): any;

    /** Gets a new component on an entity */
    getComponent(
      /** the id of the entity to add the component to */
      entityID: number,
      /** the name of the component to add */
      component: string
    ): any;

    /** Sets a primitive value for a component.
     * To change a component that holds an object, use getComponent instead. */
    setComponent(
      /** the id of the entity to set the component on */
      entityID: number,
      /** the name of the component to set */
      component: string,
      /** the primitive value to set */
      value: any
    ): void;

    /** Removes a component from an entity.
     * The onRemoveComponent callbacks are fired for the removed component. */
    removeComponent(
      /** the id of the entity to remove the component from */
      entityID: number,
      /** the name of the component to remove */
      component: string
    ): void;

    /** Registers a callback to be called when component is added to any entity. */
    onAddComponent(
      /** component name */
      component: string,
      /** callback function */
      callback: (entityID: number, component: string, value: any) => void,
    ): void;

    /** Registers a callback to be called when component is removed from any entity */
    onRemoveComponent(
      /** component name */
      component,
      /** callback function */
      callback: (entityID: number, component: string, removedValue: any) => void,
    ): void;

    /** Registers a named search for entities that have all components listed in the components array. */
    registerSearch(
      /** the name of the search to register */
      search,
      /** an array of component names that an entity must possess to be included in the results */
      components
    ): void;

    /** Returns a list of entity ids for all entities that match the search. */
    find(
      /** named search identifier */
      search: string
    ): number[];

    /** Load entities into an entity pool from an array of objects. load should only be used to fill an empty EntityPool. */
    load(
      /** some JSON-compatible object returned by save */
      entities: any,
    ): void;

    /** Returns an object suitable for saving all entities in the EntityPool to a JSON file */
    save(): void;
  }
}

// declare module "*.worker" {
//   const content: any;
//   export = content;
// }

// declare module "promise-worker" {
//   class PromiseWorker {
//     constructor(worker: any)
//     postMessage(message: any)
//   }
//   export default PromiseWorker;
// }

// declare module "ndarray-fill" {
//   const content: any;
//   export = content;
// }

// declare module "ndarray-bits" {
//   const content: any;
//   export = content;
// }

// declare module "ndarray-ops" {
//   const content: any;
//   export = content;
// }

// declare module "simplex-noise" {
//   const content: any;
//   export = content;
// }

// declare module "alea" {
//   const content: any;
//   export = content;
// }

// declare module "ngraph.graph" {
//   export interface Node {
//     id: any;
//     data: any;
//   }
//   export interface Graph {
//     addNode(id?: any): Node;
//     getLink(left: any, right: any): Node;
//     getNode(id?: any): Node;
//   }
//   type createGraph = () => Graph;
//   export default createGraph;
// }


// declare module "ngraph.generators" {
//   import { Graph } from 'ngraph.graph';
//   export type grid = (width: number, height: number) => Graph;
// }
