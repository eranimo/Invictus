import Entity from '../entity';
import EntityAttribute from '../entityAttribute';
import EntityBehavior from '../entityBehavior';


class HealthAttribute extends EntityAttribute<number> {
  protected onChange(newValue: number): number | null {
    return Math.max(newValue, 0);
  }
}

class DamageBehavior extends EntityBehavior {
  static requirements = [HealthAttribute];

  onAdd() {
    this.onEntityEvent('damage', this.onDamage.bind(this));
  }

  onDamage(event) {
    const health = this.entity.attributes.get(HealthAttribute);
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
    let health: HealthAttribute;
    beforeEach(() => {
      health = wall.addAttribute(HealthAttribute, 1);
    });

    afterAll(() => {
      wall.removeAttribute(HealthAttribute);
    });

    it('initial value', () => {
      expect(health.value).toBe(1);
    });

    it('addAttribute', () => {
      expect(wall.attributes.has(HealthAttribute)).toBeTruthy();
    });

    it('removeAttribute', () => {
      wall.removeAttribute(HealthAttribute);
      expect(wall.attributes.has(HealthAttribute)).not.toBeTruthy();
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
    it('attribute validation', () => {
      expect(() => wall.addBehavior(DamageBehavior)).toThrow();
    });

    it('addBehavior', () => {
      wall.addAttribute(HealthAttribute, 1);
      const damage = wall.addBehavior(DamageBehavior);
      expect(wall.behaviors.has(DamageBehavior)).toBeTruthy();
    });

    it('removeBehavior', () => {
      wall.addAttribute(HealthAttribute, 1);
      const damage = wall.addBehavior(DamageBehavior);
      wall.removeBehavior(DamageBehavior);

      expect(wall.behaviors.has(DamageBehavior)).not.toBeTruthy();
    });
  });
});
