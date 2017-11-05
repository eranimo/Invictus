export class Action {

}

export default class Agent {
  actions: Array<Action>;

  constructor() {
    this.actions = [new Action()];
  }
}
