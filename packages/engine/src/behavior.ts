export default interface IBehavior {
  /** Called when Node enters a SceneTree */
  enter?();

  /** Called when Node exits a SceneTree */
  exit?();

  /** Called when all of Node's children have entered a SceneTree */
  ready?();

  /** Called on every process frame */
  process?(elapsedTime: number);

  /** Called on every render frame */
  render?(elapsedTime: number);
}
