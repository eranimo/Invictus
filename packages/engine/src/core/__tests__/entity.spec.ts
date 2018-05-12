import EntityManager from '../entityManager';
import Component from '../component';


interface IFoobar {
  bar: string
};
class Foobar extends Component<IFoobar> { }

interface IBarbaz {
  num: number
};
class Barbaz extends Component<IBarbaz> { }

describe('Entity', () => {
  let manager: EntityManager;

  beforeEach(() => {
    manager = new EntityManager();
  });

  it('creation', () => {
    expect(manager.entityCount).toBe(0);
    const entity1 = manager.createEntity();
    expect(manager.entityCount).toBe(1);
    expect(entity1).toBe(1);
  });

  it('hasEntity & getEntity', () => {
    const entity1 = manager.createEntity();
    expect(manager.hasEntity(entity1)).toBe(true);
    expect(manager.getEntity(entity1).size).toBe(0);
  });

  it('removeEntity', () => {
    const entity1 = manager.createEntity();
    expect(manager.hasEntity(entity1)).toBe(true);
    expect(manager.entityCount).toBe(1);
    manager.removeEntity(entity1);
    expect(manager.hasEntity(entity1)).toBe(false);
    expect(manager.entityCount).toBe(0);
  });

  it('registerComponent', () => {
    expect(manager.isComponent('foobar')).toBe(false);
    manager.registerComponent('foobar', Foobar);
    expect(manager.isComponent('foobar')).toBe(true);
  });

  it('addComponent', () => {
    manager.registerComponent('foobar', Foobar);
    const entity1 = manager.createEntity();
    expect(manager.getEntity(entity1).size).toBe(0);
    manager.addComponent<IFoobar>(entity1, 'foobar', { bar: 'baz' });
    expect(manager.getEntity(entity1).size).toBe(1);
  });

  it('removeComponent', () => {
    manager.registerComponent('foobar', Foobar);
    const entity1 = manager.createEntity();
    manager.addComponent<IFoobar>(entity1, 'foobar', { bar: 'baz' });
    expect(manager.getEntity(entity1).size).toBe(1);
    manager.removeComponent(entity1, 'foobar');
    expect(manager.getEntity(entity1).size).toBe(0);
  });

  describe('reactive', () => {
    it('subsctibe to all entities', () => {
      manager.registerComponent('foobar', Foobar);
      manager.registerComponent('barbaz', Barbaz);
      const mock = jest.fn();
      manager.entityMap.subscribe(mock);
      const entityID = manager.createEntity();
      manager.addComponent(entityID, 'foobar', { bar: 'asd' });
      expect(mock).toBeCalled();
    });

    it('subscribe to single entity', () => {
      manager.registerComponent('foobar', Foobar);
      manager.registerComponent('barbaz', Barbaz);
      const entityID = manager.createEntity();
      const entity = manager.getEntity(entityID);
      manager.addComponent(entityID, 'foobar', { bar: 'asd' });
      const mock = jest.fn();
      entity.subscribe(mock);
      expect(mock).toBeCalled();
    });
  });
});
