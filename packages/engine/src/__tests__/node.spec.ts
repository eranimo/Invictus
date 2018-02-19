import Node from '../node';
import SceneTree from '../sceneTree';


describe('Node', () => {
  test('default properties', () => {
    class SomeNode extends Node<any> {
      static defaultProps = {
        bar: 'baz',
      };
    }
    const main = new SomeNode('main', {
      foobar: 'barbaz'
    });
    expect(main.props).toMatchObject({
      bar: 'baz',
      foobar: 'barbaz',
    });
  });

  test('children operations', () => {
    const main = new Node('main', {
      foobar: 'barbaz'
    });
    const child1 = new Node('child1', {
      foo: 1,
    });
    const child2 = new Node('child2', {
      foo: 2,
    });
    main.addChild(child1);
    main.addChild(child2);
    expect(main.hasChild(child1)).toBe(true);
    expect(main.hasChild(child2)).toBe(true);
    expect(main.childCount).toBe(2);

    main.removeChild(child1);
    expect(main.hasChild(child1)).toBe(false);
    expect(main.childCount).toBe(1);
  });

  it('node instances can not be used multiple times as children', () => {
    const parent = new Node('parent');
    const child = new Node('child');
    parent.addChild(child);
    expect(() => parent.addChild(child)).toThrow();
  });

  it('children names are unique', () => {
    const parent = new Node('parent');
    const child1 = new Node('child');
    const child2 = new Node('child');
    parent.addChild(child1);
    expect(() => parent.addChild(child2)).toThrow();
  });

  test('exporting', () => {
    const main = new Node('main', {
      a: 1,
      b: true
    });
    const child = new Node('child', {
      a: 2,
    });
    main.addChild(child);
    expect(main.exportTreeJSON()).toBe(JSON.stringify({
      type: 'Node',
      name: 'main',
      props: {
        a: 1,
        b: true,
      },
      children: [
        {
          type: 'Node',
          name: 'child',
          props: {
            a: 2,
          },
        },
      ],
    }));
  });

  test('importing', () => {
    const main = new Node('main', {
      a: 1,
      b: true
    });
    const child = new Node('child', {
      a: 2,
    });
    main.addChild(child);
    const exported = main.exportTree();
    const imported = Node.import(exported);
    expect(imported.name).toBe('main');
  });

  test('isEqual', () => {
    const n1 = new Node('node', {
      a: 1,
      b: true
    });
    const n2 = new Node('node', {
      a: 1,
      b: true
    });
    expect(n1.isEqual(n2)).toBe(true);
  });

  test('isEqualTree', () => {
    const n1 = new Node('node', {
      a: 1,
      b: true
    });
    const c1 = new Node('child', {
      a: 2,
    });
    n1.addChild(c1);
    const n2 = new Node('node', {
      a: 1,
      b: true
    });
    const c2 = new Node('child', {
      a: 2,
    });
    n2.addChild(c2);
    expect(n1.isEqualTree(n2)).toBe(true);
  });

  test('duplicate', () => {
    const main = new Node('main', {
      a: 1,
      b: true
    });
    expect(main.isEqual(main.duplicate())).toBe(true);
  });

  test('duplicateTree', () => {
    const main = new Node('main', {
      a: 1,
      b: true
    });
    const child = new Node('child', {
      a: 2,
    });
    main.addChild(child);
    expect(main.isEqualTree(main.duplicateTree())).toBe(true);
    expect(main.isEqualTree(main.duplicate())).toBe(false);
  });

  test('forEachChild', () => {
    let count = 0;

    const n1 = new Node('node', {
      a: 1,
      b: true
    });
    const c1 = new Node('child1', { c: 1 });
    const c2 = new Node('child2', { c: 2 });
    const c3 = new Node('child3', { c: 3 });
    n1.addChild(c1);
    n1.addChild(c2);
    n1.addChild(c3);
    expect(n1.childCount).toBe(3);
    const countUp = child => count += child.props.c;
    n1.forEachChild(countUp);
    expect(count).toBe(6);
  });

  test('forEachChildInTree', () => {
    let count = 0;

    const n1 = new Node('node', {
      a: 1,
      b: true
    });
    const c1 = new Node('child1', { c: 1 });
    const c1_5 = new Node('child1.5', { c: 1 });
    const c2 = new Node('child2', { c: 2 });
    const c3 = new Node('child3', { c: 3 });
    const c3_5 = new Node('child3.5', { c: 0 });
    n1.addChild(c1);
    c1.addChild(c1_5)
    n1.addChild(c2);
    n1.addChild(c3);
    c3.addChild(c3_5);
    expect(n1.childCount).toBe(3);
    expect(c1.childCount).toBe(1);
    expect(c3.childCount).toBe(1);
    const countUp = child => count += child.props.c;
    n1.forEachChildInTree(countUp);
    expect(count).toBe(7);
  });

  describe('path operations', () => {
    let root;
    let c1;
    let c2;
    let c3_1;

    beforeAll(async () => {
      root = new Node('root_node', {
        a: 1,
        b: true
      });
      const scene = new SceneTree();
      await scene.changeScene(root);
      c1 = new Node('two_one', {
        data: true
      });
      c2 = new Node('two_two', {
        data: false
      });
      root.addChild(c1);
      root.addChild(c2);

      c3_1 = new Node('three_one', {
        foo: 'bar'
      });
      c2.addChild(c3_1);
    });

    it('isRoot', () => {
      expect(root.isRoot).toBe(true);
      expect(c1.isRoot).toBe(false);
    });

    it('getPath', () => {
      expect(root.getPath()).toBe('/root');
      expect(c1.getPath()).toBe('/root/two_one');
      expect(c2.getPath()).toBe('/root/two_two');
      expect(c3_1.getPath()).toBe('/root/two_two/three_one');
    });

    describe('getNode', () => {
      it('relative', () => {
        expect(c2.getNode('two_two')).toBe(null);
        expect(c2.getNode('three_one')).toBe(c3_1);
        expect(root.getNode('two_two')).toBe(c2);
        expect(root.getNode('two_two/three_one')).toBe(c3_1);
      });

      it('relative - upwards', () => {
        expect(c3_1.getNode('..')).toBe(c2);
        expect(c3_1.getNode('../..')).toBe(root);
        expect(c3_1.getNode('../../two_one')).toBe(c1);
      });

      it('absolute', () => {
        expect(root.getNode('/root')).toBe(root);
        expect(c1.getNode('/root/two_one')).toBe(c1);
        expect(c1.getNode('/root/two_two')).toBe(c2);
      });
    });
  });
});

describe('SceneTree', () => {
  it('should change scenes', async () => {
    const scene = new SceneTree();
    const parent = new Node('parent');
    const child = new Node('child');
    parent.addChild(child);

    expect(scene.currentScene).toBe(null);
    parent.onEnterTree = jest.fn();
    child.onEnterTree = jest.fn();
    await scene.changeScene(parent);
    expect(scene.currentScene).toBe(parent);
    expect(parent.onEnterTree).toHaveBeenCalled();
    expect(child.onEnterTree).toHaveBeenCalled();

    expect(parent.tree).toBe(scene);
    expect(child.tree).toBe(scene);

    // child nodes added after scene enter
    const grandchild = new Node('grandchild');
    grandchild.onEnterTree = jest.fn();
    child.addChild(grandchild);
    expect(grandchild.onEnterTree).toHaveBeenCalled();

  });
});

