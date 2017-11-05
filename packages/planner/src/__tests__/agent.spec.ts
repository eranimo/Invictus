import { Agent, Plan, Action, Goal } from '../index';

type State = {
  hasAxe: boolean,
  hasLog: boolean,
  canGetAxe: boolean,
};


// actions
class ChopLog implements Action<State> {
  cost(): number {
    return 4;
  }

  precondition(state: State): boolean {
    return !state.hasLog && state.hasAxe;
  }

  effect(state: State): State {
    state.hasLog = true;
    return state;
  }
}

class GetAxe implements Action<State> {
  cost(): number {
    return 2;
  }

  precondition(state: State): boolean {
    return !state.hasAxe && state.canGetAxe;
  }

  effect(state: State): State {
    state.hasAxe = true;
    return state;
  }
}

class CollectBranches implements Action<State> {
  cost(): number {
    return 8;
  }

  precondition(state: State): boolean {
    return !state.hasLog;
  }

  effect(state: State): any {
    state.hasLog = true;
    return state;
  }
}

class MakeFirewoodGoal implements Goal<State> {
  condition(state: State) {
    return state.hasLog == true;
  }
}

class Woodcutter extends Agent<State> {
  constructor(state: State) {
    super();
    this.state = state;

    this.addAction(new ChopLog());
    this.addAction(new GetAxe());
    this.addAction(new CollectBranches());
  }

  plan(): Plan<State> | null {
    return Plan.formulate<State>(this, new MakeFirewoodGoal());
  }
}


describe('Make firewood GOAP plan', () => {
  it('best way to get logs without an axe', () => {
    let woodcutter = new Woodcutter({
      hasAxe: false,
      hasLog: false,
      canGetAxe: false,
    });
    expect(woodcutter.actions.size).toBe(3);

    const plan = woodcutter.plan();

    expect(plan).toBeDefined();
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

    expect(plan).toBeDefined();
    expect(plan.sequence).toHaveLength(2);
    expect(plan.sequence[0]).toBeInstanceOf(GetAxe);
    expect(plan.sequence[1]).toBeInstanceOf(ChopLog);
  });
});
