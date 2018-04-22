import Game from './game';


export enum TimerStatus {
  INACTIVE,
  ACTIVE,
  COMPLETE,
}

export class Timer {
  game: Game;
  status: TimerStatus;
  ticks: number;
  onComplete: Function;

  constructor(game: Game, onComplete: Function, ticks: number) {
    this.game = game;
    this.onComplete = onComplete;
    this.ticks = ticks;
    this.status = TimerStatus.INACTIVE;
  }

  start() {
    this.status = TimerStatus.ACTIVE;
  }

  process() {
    if (this.status !== TimerStatus.ACTIVE) {
      return;
    }
    if (this.game.ticks >= this.ticks) {
      this.onComplete();
      this.status = TimerStatus.COMPLETE;
    }
  }
}

export class TimeManager {
  timers: Timer[];
  game: Game;

  constructor(game: Game) {
    this.timers = [];
    this.game = game;
  }

  public createTimer(onComplete: Function, ticks: number): Timer {
    const timer = new Timer(this.game, onComplete, ticks);
    this.timers.push(timer);
    return timer;
  }

  process() {
    for (const timer of this.timers) {
      timer.process();
    }
  }
}
