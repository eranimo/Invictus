import Entity from './entity';
import { EventCallback } from './eventEmitter';
import EntityComponent from './entityComponent';


export default abstract class EntityBehavior extends EntityComponent {
  /** Called when added to an Entity */
  onAdd() {}

  /** Called when removed from an Entity */
  onRemove() {}

  /** Called on main loop update */
  onUpdate(elapsedTime: number) { }

  /** Called on main loop draw */
  onDraw(elapsedTime: number) { }
}
