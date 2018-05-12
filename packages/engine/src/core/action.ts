export abstract class Action {
  public isFinished: boolean;

  constructor() {
    this.isFinished = false;
  }

  public process(elapsedTime: number) {
    if (!this.isFinished) {
      this.onUpdate(elapsedTime);
    }
  }

  public onUpdate(elapsedTime: number) {
    throw new Error('Not implemented');
  }
}

export abstract class CompositeAction extends Action {
  public isFinished: boolean;
  public actions: Action[];

  constructor() {
    super();
    this.actions = [];
  }

  public add(...actions: Action[]) {
    this.actions.push(...actions);
  }
}

export class Parallel extends CompositeAction {
  public onUpdate(elapsedTime: number) {
    this.actions.forEach((a) => a.process);
    this.actions = this.actions.filter((action) => !action.isFinished);
    this.isFinished = this.actions.length === 0;
  }
}

export class Sequence extends CompositeAction {
  public onUpdate(elapsedTime: number) {
    if (this.actions.length > 0) {
      this.actions[0].process(elapsedTime);
      if (this.actions[0].isFinished) {
        this.actions.shift();
      }
    }
    this.isFinished = this.actions.length === 0;
  }
}
