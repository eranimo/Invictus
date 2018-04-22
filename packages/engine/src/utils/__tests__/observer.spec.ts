import { Observer, Subject } from '../observer';


class Health {
  value: number;
  subject: Subject<Health>;

  constructor(value: number) {
    this.value = value;
    this.subject = new Subject<Health>();
  }

  update(newValue: number) {
    this.subject.notify(this, { newValue, oldValue: this.value });
    this.value = newValue;
  }
}

class HealthWatcher implements Observer<Health> {
  constructor(health: Health) {
    health.subject.addObserver(this);
  }

  onNotify(health: Health, data: any) {}
}

describe('Observer', () => {
  it('notify', () => {
    const health = new Health(0);
    const watcher = new HealthWatcher(health);
    watcher.onNotify = jest.fn();
    expect(health.value).toBe(0);

    health.update(1);
    expect(health.value).toBe(1);
    expect(watcher.onNotify).toBeCalledWith(health, { newValue: 1, oldValue: 0 });
  });
});
