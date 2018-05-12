import Component from '../component';
import EntityGroup from '../entityGroup';
import EntityManager from '../entityManager';


interface IFoobar {
  bar: string;
}
class Foobar extends Component<IFoobar> { }

interface IBarbaz {
  num: number;
}
class Barbaz extends Component<IBarbaz> { }

describe('EntityGroup', () => {
  let manager: EntityManager;

  beforeEach(() => {
    manager = new EntityManager();
  });

  it('watch for changes to group', () => {
    manager.registerComponent('foobar', Foobar);
    manager.registerComponent('barbaz', Barbaz);
    const mockAdded = jest.fn();
    const mockRemoved = jest.fn();
    const group = new EntityGroup(manager, ['foobar']);
    group.addedEntities$.subscribe(mockAdded);
    group.removedEntities$.subscribe(mockRemoved);
    group.watch();
    const entityID = manager.createEntity();
    // group is empty
    expect(group.entityIDs.size).toBe(0);

    // add foobar, entity added to group
    manager.addComponent(entityID, 'foobar', { bar: 'asd' });
    expect(group.entityIDs.has(entityID)).toBe(true);
    expect(mockAdded).toBeCalledWith([entityID]);

    // remove foobar, entity removed from group
    manager.removeComponent(entityID, 'foobar');
    expect(group.entityIDs.has(entityID)).toBe(false);
    expect(mockRemoved).toBeCalledWith([entityID]);

    // add it back
    manager.addComponent(entityID, 'foobar', { bar: 'asd' });
    expect(group.entityIDs.has(entityID)).toBe(true);
    expect(mockAdded).toBeCalledWith([entityID]);

    // delete entity, removed from group
    manager.removeEntity(entityID);
    expect(group.entityIDs.has(entityID)).toBe(false);
    expect(mockRemoved).toBeCalledWith([entityID]);
  });
});
