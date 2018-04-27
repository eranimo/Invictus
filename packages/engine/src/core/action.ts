export abstract class Action {
  isFinished: boolean;

  constructor() {
    this.isFinished = false;
  }

  process(elapsedTime: number) {
    if (!this.isFinished) {
      this.onUpdate(elapsedTime);
    }
  }

  onUpdate(elapsedTime: number) {}
}

export abstract class CompositeAction extends Action {
  isFinished: boolean;
  actions: Action[];

  constructor() {
    super();
    this.actions = [];
  }

  add(...actions: Action[]) {
    this.actions.push(...actions);
  }
}

export class Parallel extends CompositeAction {
  onUpdate(elapsedTime: number) {
    this.actions.forEach(a => a.process);
    this.actions = this.actions.filter(action => !action.isFinished);
    this.isFinished = this.actions.length === 0;
  }
}

export class Sequence extends CompositeAction {
  onUpdate(elapsedTime: number) {
    if (this.actions.length > 0) {
      this.actions[0].process(elapsedTime);
      if (this.actions[0].isFinished) {
        this.actions.shift();
      }
    }
    this.isFinished = this.actions.length === 0;
  }
}

