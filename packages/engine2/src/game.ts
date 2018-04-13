import EntityManager from './entityManager';


class Game extends MainLoop {
  entityManager: EntityManager;

  constructor() {
    super();
    this.entityManager = new EntityManager();
  }

  process(elapsedTime: number) {
    this.entityManager.entities.forEach(entity => {
      entity.behaviors.forEach(behavior => behavior.onUpdate(elapsedTime));
    });
  }

  render(elapsedTime: number) {
    this.entityManager.entities.forEach(entity => {
      entity.behaviors.forEach(behavior => behavior.onDraw(elapsedTime));
    });
  }
}
