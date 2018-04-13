import Entity from './entity';
import { EventCallback } from './eventEmitter';


export default abstract class EntityComponent {
  entity: Entity;

  constructor(entity: Entity) {
    this.entity = entity;
  }

  /** Send an entity event */
  emitEntityEvent(eventName: string, ...props) {
    this.entity.emit(eventName, ...props);
  }

  /** Listen for an entity event */
  onEntityEvent(eventName: string, callback: EventCallback) {
    this.entity.on(eventName, callback);
  }
}
