export default class MainLoop {
  lastTime: number
  running: boolean;

  constructor() {
    this.lastTime = -1;
    this.running = false;
  }

  start() {
    console.log(`Game Loop: start`);
    if (this.running) {
      return;
    }
    this.running = true;
    this.lastTime = -1;
    window.requestAnimationFrame(this.run.bind(this));
  }

  stop() {
    console.log(`Game Loop: stop`);
    if (this.running) {
      this.running = false;
    }
  }

  process(elapsedTime: number) { }
  render(elapsedTime: number) { }

  private run(time) {
    if (this.lastTime === -1) {
      this.lastTime = time;
    }
    var elapsed = time - this.lastTime;
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
