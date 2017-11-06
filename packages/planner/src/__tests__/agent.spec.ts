import { Agent, Plan, Action, Goal } from '../index';

type WoodState = {
  hasAxe: boolean,
  hasLog: boolean,
  canGetAxe: boolean,
};

type IronState = {
  numIron: number,
};


// actions
class ChopLog implements Action<WoodState> {
  cost(): number {
    return 4;
  }

  precondition(state: WoodState): boolean {
    return !state.hasLog && state.hasAxe;
  }

  effect(state: WoodState): WoodState {
    state.hasLog = true;
    return state;
  }
}

class GetAxe implements Action<WoodState> {
  cost(): number {
    return 2;
  }

  precondition(state: WoodState): boolean {
    return !state.hasAxe && state.canGetAxe;
  }

  effect(state: WoodState): WoodState {
    state.hasAxe = true;
    return state;
  }
}

class CollectBranches implements Action<WoodState> {
  cost(): number {
    return 8;
  }

  precondition(state: WoodState): boolean {
    return !state.hasLog;
  }

  effect(state: WoodState): any {
    state.hasLog = true;
    return state;
  }
}

class MakeFirewoodGoal implements Goal<WoodState> {
  condition(state: WoodState) {
    return state.hasLog == true;
  }
}

class Woodcutter extends Agent<WoodState> {
  constructor(state: WoodState) {
    super();
    this.state = state;

    this.addAction(new ChopLog());
    this.addAction(new GetAxe());
    this.addAction(new CollectBranches());
  }

  plan(): Plan<WoodState> | null {
    return Plan.formulate<WoodState>(this, new MakeFirewoodGoal());
  }
}

class GetIronGoal implements Goal<IronState> {
  condition(state: IronState) {
    return state.numIron >= 10;
  }

  comparator(oldState: IronState, newState: IronState) {
    return newState.numIron - oldState.numIron;
  }
}

class BadIronGoal implements Goal<IronState> {
  condition(state: IronState) {
    return state.numIron === -10;
  }
}

class MineIron implements Action<IronState> {
  cost(): number { return 4 };

  // can always do
  precondition(state: IronState): boolean { return true }

  effect(state: IronState): any {
    state.numIron += 2;
    return state;
  }
}

class RecycleIron implements Action<IronState> {
  cost(): number { return 10 };

  // can always do
  precondition(state: IronState): boolean { return true }

  effect(state: IronState): any {
    state.numIron += 5;
    return state;
  }
}

class Miner extends Agent<IronState> {
  constructor(state: IronState) {
    super();
    this.state = state;

    this.addAction(new MineIron());
    this.addAction(new RecycleIron());
  }

  plan(): Plan<IronState> | null {
    return Plan.formulate<IronState>(this, new GetIronGoal());
  }

  badPlan(): Plan<IronState> | null {
    return Plan.formulate<IronState>(this, new BadIronGoal());
  }
}

describe('Goal planner', () => {
  describe('with boolean state', () => {
    it('best way to get logs without an axe', () => {
      let woodcutter = new Woodcutter({
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
      let woodcutter = new Woodcutter({
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
      let woodcutter = new Woodcutter({
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
      let miner = new Miner({ numIron: 0 });

      const plan = miner.plan();

      expect(plan).not.toBe(null);
      expect(plan.sequence).toHaveLength(2);
      for (let i = 0; i < 2; i++) {
        expect(plan.sequence[i]).toBeInstanceOf(RecycleIron);
      }
      expect(plan.totalCost).toBe(20);
    });

    it('impossible goal', () => {
      let miner = new Miner({ numIron: 0 });

      const plan = miner.badPlan();

      expect(plan).toBe(null);
    });
  });
});
