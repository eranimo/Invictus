import Entity from './entity';
import EventEmitter from './eventEmitter';
import EntityComponent from './entityComponent';
import { EventCallback } from './eventEmitter';


export default abstract class EntityAttribute<T> extends EntityComponent {
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
