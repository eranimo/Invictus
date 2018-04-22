import Keyboard from 'keyboardjs';


const DEBUG = false;

export default class InputManager {
  private pressedKeys: {
    [key: string]: boolean
  };

  constructor() {
    this.pressedKeys = {};
    this.basicListeners();
  }

  private basicListeners() {
    this.listen('shift');
  }

  public listen(key: string) {
    Keyboard.bind(
      key,
      (event) => {
        if (DEBUG) console.log(`${key} pressed`);
        this.pressedKeys[key] = true;
      },
      (event) => {
        if (DEBUG) console.log(`${key} released`);
        this.pressedKeys[key] = false;
      }
    );
  }

  public isPressed(key: string): boolean {
    return this.pressedKeys[key] === true;
  }

  public reset(context: string) {
    Keyboard.reset();
    this.basicListeners();
    Keyboard.setContext(context);
    this.pressedKeys = {};
  }
}
