export default class MainLoop {
  public lastTime: number;
  public running: boolean;

  constructor() {
    this.lastTime = -1;
    this.running = false;
  }

  public start() {
    console.log(`Game Loop: start`);
    if (this.running) {
      return;
    }
    this.running = true;
    this.lastTime = -1;
    window.requestAnimationFrame(this.run.bind(this));
  }

  public stop() {
    console.log(`Game Loop: stop`);
    if (this.running) {
      this.running = false;
    }
  }

  public process(elapsedTime: number) {
    // not implemented
  }
  public render(elapsedTime: number) {
    // not implemented
  }

  private run(time) {
    if (this.lastTime === -1) {
      this.lastTime = time;
    }
    const elapsed = time - this.lastTime;
    this.lastTime = time;

    // simulate scenes
    this.process(elapsed);

    // render scenes
    this.render(elapsed);

    if (this.running) {
      window.requestAnimationFrame(this.run.bind(this));
    }
  }
}
