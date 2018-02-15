import { Scene } from '@invictus/engine';


export default class MainScene extends Scene {
  static foobar = 22;
  get renderSystems() {
    return [function (ecs) {
      // ecs.add(() => {
      //   console.log(1);
      // });
    }];
  }
}
