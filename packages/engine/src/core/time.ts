import Game from './game';

export enum TimerStatus {
  INACTIVE,
  ACTIVE,
  COMPLETE,
}

export class Timer {
  public game: Game;
  public status: TimerStatus;
  public ticks: number;
  public onComplete: () => void;

  constructor(game: Game, onComplete: () => void, ticks: number) {
    this.game = game;
    this.onComplete = onComplete;
    this.ticks = ticks;
    this.status = TimerStatus.INACTIVE;
  }

  public start() {
    this.status = TimerStatus.ACTIVE;
  }

  public process() {
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
  public timers: Timer[];
  public game: Game;

  constructor(game: Game) {
    this.timers = [];
    this.game = game;
  }

  public createTimer(onComplete: () => void, ticks: number): Timer {
    const timer = new Timer(this.game, onComplete, ticks);
    this.timers.push(timer);
    return timer;
  }

  public process() {
    for (const timer of this.timers) {
      timer.process();
    }
  }
}
