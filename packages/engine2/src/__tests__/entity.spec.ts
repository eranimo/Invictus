import Entity from '../entity';
import EntityAttribute from '../entityAttribute';
import EntityBehavior from '../entityBehavior';


type THealthAttribute = number;
class HealthAttribute extends EntityAttribute<THealthAttribute> {
  protected onChange(newValue: THealthAttribute): THealthAttribute | null {
    return Math.max(newValue, 0);
  }
}

class DamageBehavior extends EntityBehavior {
  onAdd() {
    this.onEntityEvent('damage', this.onDamage.bind(this));
  }

  onDamage(event) {
    const health = this.entity.attributes.get('health');
    health.value -= event.amount;
  }
}

describe('Entity', () => {
  let wall: Entity;

  beforeEach(() => {
    wall = new Entity();
  });

  it('should initialize', () => {
    expect(wall.attributes.size).toBe(0);
    expect(wall.behaviors.size).toBe(0);
  });

  describe('attributes', () => {
    let health;
    beforeEach(() => {
      health = new HealthAttribute(wall, 1);
      wall.addAttribute('health', health);
    });

    afterAll(() => {
      wall.removeAttribute('health');
    });

    it('initial value', () => {
      expect(health.value).toBe(1);
    });

    it('addAttribute', () => {
      expect(wall.attributes.has('health')).toBeTruthy();
    });

    it('removeAttribute', () => {
      wall.removeAttribute('health');
      expect(wall.attributes.has('health')).not.toBeTruthy();
    });

    it('onChange method', () => {
      expect(health.value).toBe(1);
      health.value = -100;
      expect(health.value).toBe(0);
    });

    it('subscribe to changes', () => {
      const onChangeCB = jest.fn();
      health.subscribe(onChangeCB);
      health.value = 10;
      expect(onChangeCB).toBeCalled();
      expect(onChangeCB).toBeCalledWith({ newValue: 10, oldValue: 1 });
    })
  });

  describe('behaviors', () => {
    it('addBehavior', () => {
      const damage = new DamageBehavior(wall);
      wall.addBehavior('damage', damage);
      expect(wall.behaviors.has('damage')).toBeTruthy();
    });

    it('removeBehavior', () => {
      const damage = new DamageBehavior(wall);
      wall.addBehavior('damage', damage);
      wall.removeBehavior('damage');

      expect(wall.behaviors.has('damage')).not.toBeTruthy();
    });
  });
});
