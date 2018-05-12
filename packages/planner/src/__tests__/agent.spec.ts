import { Agent, IAction, IGoal, Plan } from '../plan';

interface IWoodcutterState {
  hasAxe: boolean;
  hasLog: boolean;
  canGetAxe: boolean;
}

interface IMinerState {
  numIron: number;
}

// actions
class ChopLog implements IAction<IWoodcutterState> {
  public cost(): number {
    return 4;
  }

  public precondition(state: IWoodcutterState): boolean {
    return !state.hasLog && state.hasAxe;
  }

  public effect(state: IWoodcutterState): IWoodcutterState {
    state.hasLog = true;
    return state;
  }
}

class GetAxe implements IAction<IWoodcutterState> {
  public cost(): number {
    return 2;
  }

  public precondition(state: IWoodcutterState): boolean {
    return !state.hasAxe && state.canGetAxe;
  }

  public effect(state: IWoodcutterState): IWoodcutterState {
    state.hasAxe = true;
    return state;
  }
}

class CollectBranches implements IAction<IWoodcutterState> {
  public cost(): number {
    return 8;
  }

  public precondition(state: IWoodcutterState): boolean {
    return !state.hasLog;
  }

  public effect(state: IWoodcutterState): any {
    state.hasLog = true;
    return state;
  }
}

class MakeFirewoodGoal implements IGoal<IWoodcutterState> {
  public condition(state: IWoodcutterState) {
    return state.hasLog === true;
  }
}

class Woodcutter extends Agent<IWoodcutterState> {
  constructor(state: IWoodcutterState) {
    super();
    this.state = state;

    this.addAction(new ChopLog());
    this.addAction(new GetAxe());
    this.addAction(new CollectBranches());
  }

  public plan(): Plan<IWoodcutterState> | null {
    return Plan.formulate<IWoodcutterState>(this, new MakeFirewoodGoal());
  }
}

class GetIronGoal implements IGoal<IMinerState> {
  public condition(state: IMinerState) {
    return state.numIron >= 10;
  }

  public comparator(oldState: IMinerState, newState: IMinerState) {
    return newState.numIron - oldState.numIron;
  }
}

class BadIronGoal implements IGoal<IMinerState> {
  public condition(state: IMinerState) {
    return state.numIron === -10;
  }
}

class MineIron implements IAction<IMinerState> {
  public cost(): number { return 4; }

  // can always do
  public precondition(state: IMinerState): boolean { return true; }

  public effect(state: IMinerState): any {
    state.numIron += 2;
    return state;
  }
}

class RecycleIron implements IAction<IMinerState> {
  public cost(): number { return 10; }

  // can always do
  public precondition(state: IMinerState): boolean { return true; }

  public effect(state: IMinerState): any {
    state.numIron += 5;
    return state;
  }
}

class Miner extends Agent<IMinerState> {
  constructor(state: IMinerState) {
    super();
    this.state = state;

    this.addAction(new MineIron());
    this.addAction(new RecycleIron());
  }

  public plan(): Plan<IMinerState> | null {
    return Plan.formulate<IMinerState>(this, new GetIronGoal());
  }

  public badPlan(): Plan<IMinerState> | null {
    return Plan.formulate<IMinerState>(this, new BadIronGoal());
  }
}

describe('Goal planner', () => {
  describe('with boolean state', () => {
    it('best way to get logs without an axe', () => {
      const woodcutter = new Woodcutter({
        hasAxe: false,
        hasLog: false,
        canGetAxe: false,
      });
      expect(woodcutter.actions.size).toBe(3);

      const plan = woodcutter.plan();

      expect(plan).not.toBe(null);
      expect(plan.sequence).toHaveLength(1);
      expect(plan.sequence[0]).toBeInstanceOf(CollectBranches);
      expect(plan.totalCost).toBe(8);
    });

    it('best way to get logs with an axe', () => {
      const woodcutter = new Woodcutter({
        hasAxe: false,
        hasLog: false,
        canGetAxe: true,
      });
      expect(woodcutter.actions.size).toBe(3);

      const plan = woodcutter.plan();

      expect(plan).not.toBe(null);
      expect(plan.sequence).toHaveLength(2);
      expect(plan.sequence[0]).toBeInstanceOf(GetAxe);
      expect(plan.sequence[1]).toBeInstanceOf(ChopLog);
    });

    it('already reached goal', () => {
      const woodcutter = new Woodcutter({
        hasAxe: false,
        hasLog: true,
        canGetAxe: false,
      });
      expect(woodcutter.actions.size).toBe(3);

      const plan = woodcutter.plan();

      expect(plan).toBe(null);
    });
  });

  /**
   * Goal: get 10 iron
   * mineIron(4 cost for 2 iron) = 5 times for 20 cost
   * recycleIron(10 cost for 5 iron) = 2 times for 20 cost
   *
   * Plan: mineIron 5 times
   */
  describe('with numeric state', () => {
    it('fastest way to get iron', () => {
      const miner = new Miner({ numIron: 0 });

      const plan = miner.plan();

      expect(plan).not.toBe(null);
      expect(plan.sequence).toHaveLength(2);
      for (let i = 0; i < 2; i++) {
        expect(plan.sequence[i]).toBeInstanceOf(RecycleIron);
      }
      expect(plan.totalCost).toBe(20);
    });

    it('impossible goal', () => {
      const miner = new Miner({ numIron: 0 });

      const plan = miner.badPlan();

      expect(plan).toBe(null);
    });
  });
});
