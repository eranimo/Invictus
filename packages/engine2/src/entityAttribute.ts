import Entity from './entity';
import EntityComponent from './entityComponent';
import EventEmitter, { EventCallback } from './utils/eventEmitter';


export default abstract class EntityAttribute<T = any> extends EntityComponent {
  private _value: T | null;
  private eventEmitter: EventEmitter;

  constructor(entity: Entity, initialValue: T = null) {
    super(entity);
    this._value = initialValue;
    this.eventEmitter = new EventEmitter();
  }

  get value() {
    return this._value;
  }

  set value(newValue: any) {
    const oldValue = this.value;
    const validatedValue = this.onChange(newValue);
    this._value = validatedValue;
    this.eventEmitter.emit('change', { newValue: validatedValue, oldValue });
  }

  public subscribe(callback: EventCallback) {
    this.eventEmitter.on('change', callback);
  }

  public clear() {
    this.value = null;
  }

  protected onChange(newValue: T): T | null {
    return newValue;
  }

  protected isValid() { }
}
