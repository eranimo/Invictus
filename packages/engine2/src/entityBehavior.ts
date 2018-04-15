import Entity, { Constructable } from './entity';
import { EventCallback } from './utils/eventEmitter';
import EntityComponent from './entityComponent';
import EntityAttribute from './entityAttribute';


export default abstract class EntityBehavior extends EntityComponent {
  static requirements: Constructable<EntityAttribute>[];

  /** Called when added to an Entity */
  onAdd() {}

  /** Called when removed from an Entity */
  onRemove() {}

  /** Called on main loop update */
  onUpdate(elapsedTime: number) { }

  /** Called on main loop draw */
  onDraw(elapsedTime: number) { }

  /** Verify that this behavior can attach to this component */
  verify(): boolean {
    const reqs = Array.from(this.entity.attributes.keys());
    for (const attr of (this.constructor as any).requirements) {
      if (!reqs.includes(attr)) {
        return false;
      }
    }
    return true;
  }
}
