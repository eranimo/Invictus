import createGraph from 'ngraph.graph';
import graphPath from 'ngraph.path';


const DEBUG = false;

export interface Goal<T> {
  // a Condition is a function that evaluates a state object
  // and returns whether or not the state object meets a criteria
  condition(state: T): boolean;

  // a comparator is a function that takes the old state and the potential new state 
  // returns a boolean 
  comparator?(oldState: T, newState: T): number;
}


export interface Action<T> {
  // a function that decides if the action can be ran
  precondition(state: T): boolean;

  // a function that mutates state after the action is executed
  effect(state: T): T;

  // a function that decides the cost of this action given the current state
  // this might be constant
  cost(state: T): number;
}


export class Plan<T> {
  sequence: Array<Action<T>>;
  totalCost: number;

  constructor(sequence: Array<Action<T>>, totalCost: number) {
    this.sequence = sequence;
    this.totalCost = totalCost;
  }

  static formulate<T>(agent: Agent<T>, goal: Goal<T>): Plan<T> | null {
    const graph = createGraph();

    let currentID = 0;
    const root = graph.addNode(currentID, {
      cost: 0,
      state: agent.state,
    });

    const actions = new Set(agent.actions);

    let goalFound = true;
    function buildGraph(node: any, actions): Node | boolean {
      let foundOne = false;
      for (const action of actions) {
        const canRun = action.precondition(node.data.state) === true;
        if (canRun) {
          const newState = action.effect(Object.assign({}, node.data.state));
          currentID++;
          const reachedGoal = goal.condition(newState);
          const cost = node.data.cost + action.cost(newState);
          const newNode = graph.addNode(currentID, {
            action,
            cost,
            state: newState,
            reachedGoal,
          });
          graph.addLink(node.id, newNode.id);

          if (reachedGoal) {
            if (DEBUG) console.log(`${action.constructor.name} - Reached Goal (cost: ${cost})`);
            // this action achieves the goal
            foundOne = true;
          } else if (goal.comparator && goal.comparator(node.data.state, newState) > 0) {
            const diff = goal.comparator(node.data.state, newState);
            if (DEBUG) console.log(`${action.constructor.name} - Repeating (${diff})`);
            const foundChild = buildGraph(newNode, actions);
            if (foundChild) {
              foundOne = true;
            }
          } else {
            if (DEBUG) console.log(`${action.constructor.name} - Continuing`);
            // this action doesn't achieve the goal
            // try another combination of actions
            actions.delete(action); // remove action from list
            const foundChild = buildGraph(newNode, actions);
            if (foundChild) {
              foundOne = true;
            }
          }
        } else {
          if (DEBUG) console.log(`${action.constructor.name} - Can NOT run`);
        }
      }
      // could not find any actions that reach goal
      return foundOne;
    }

    const result: any = buildGraph(root, actions);

    // we have found at least one path to the goal
    if (result) {
      let endNodes = [];
      graph.forEachNode(node => {
        if (node.data.reachedGoal) {
          endNodes.push(node);
        }
      });
      const sortedEndNodes = endNodes.sort((a, b) => a.data.cost - b.data.cost);
      // if (DEBUG) console.log(sortedEndNodes);
      const result = sortedEndNodes[0];
      const pathFinder = graphPath.aStar(graph);
      const path = pathFinder.find(root.id, result.id, {
        distance(fromNode, toNode, link) {
          return toNode.data.cost;
        }
      }).reverse().filter(node => node.data.action);
      const sequence = path.map(node => node.data.action);
      if (DEBUG) console.log(sequence)
      const totalCost = path[path.length - 1].data.cost;
      return new Plan(sequence, totalCost);
    }
    return null;
  }
}

export class Agent<T> {
  actions: Set<Action<T>>;
  state: Object;
  currentPlan: Plan<T>;

  constructor() {
    this.actions = new Set();
    this.state = {};
  }

  addAction(action: Action<T>) {
    this.actions.add(action);
  }
}
