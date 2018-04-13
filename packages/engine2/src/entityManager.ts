import Entity from './entity';


export default class EntityManager {
  entities: Set<Entity>;
  entityMap: { [entityID: number]: Entity };

  constructor() {
    this.entities = new Set();
    this.entityMap = {};
  }

  get entityCount(): number {
    return this.entities.size;
  }

  addEntity(entity: Entity) {
    const id = this.entityCount + 1;
    this.entities[id] = entity;
    entity.id = id;
    this.entities.add(entity);
  }

  removeEntity(entity: Entity) {
    this.entities.delete(entity);
    delete this.entities[entity.id];
  }
}
