import { EntityComponentSystem as ECS, EntityPool } from 'entity-component-system';
import Game, { System } from './game';


export enum SceneState {
  RUNNING,
  STARTING,
  STOPPED,
}

export default class Scene {
  simulation: ECS;
  renderer: ECS;
  entities: EntityPool;
  game: Game;
  state: SceneState;
  initialized: boolean;
  options: any;

  accumulativeTime: number;
  simulationStepTime: number;

  constructor(game: Game) {
    this.game = game;
    this.initialized = false;
  }

  // override in child classes
  get renderSystems(): System[] { return []; }
  get simulationSystems(): System[] { return []; }
  onEnter() {}
  onExit() {}

  private initialize() {
    this.entities = new EntityPool();
    this.simulation = new ECS();
    this.renderer = new ECS();
    this.state = SceneState.STOPPED;
    this.initialized = true;
    this.accumulativeTime = 0;
    this.simulationStepTime = 5;

    this.installSystems(this.renderSystems, this.renderer);
    this.installSystems(this.simulationSystems, this.simulation);
    this.onEnter();
  }

  private installSystems(systems: System[], ecs: ECS) {
    for (const system of systems) {
      system(ecs, this.game);
    }
  }

  start(options: any) {
    if (this.game.options.debug) console.log(`Scene ${this.constructor.name}: start`);
    if (this.state === SceneState.STOPPED) {
      return;
    }

    this.state = SceneState.STARTING;
    this.options = options;
  }

  stop() {
    if (this.game.options.debug) console.log(`Scene ${this.constructor.name}: stop`);
    if (this.state === SceneState.STOPPED) {
      return;
    }

    this.state = SceneState.STOPPED;
    this.onExit();
  }

  simulate(elapsed: number) {
    if (this.state === SceneState.STOPPED) {
      return;
    }

    if (this.state === SceneState.STARTING) {
      this.initialize();
      this.state = SceneState.RUNNING;
    }

    if (this.initialized) {
      this.initialized = false;
      this.simulation.run(this.entities, 0);
    }

    this.accumulativeTime += elapsed;
    while (this.accumulativeTime >= this.simulationStepTime) {
      this.accumulativeTime -= this.simulationStepTime;
      this.simulation.run(this.entities, this.simulationStepTime);
    }
  }

  render(elapsed: number) {
    if (this.state !== SceneState.RUNNING) {
      return;
    }
    this.renderer.run(this.entities, elapsed);
  }
}
