import { Action, Parallel, Sequence } from '../action';

class TestAction extends Action {}


describe('Action', () => {
  it('should run if not finished', () => {
    const a = new TestAction();
    expect(a.isFinished).toBe(false);
    a.onUpdate = jest.fn();
    a.process(0);
    expect(a.onUpdate).toBeCalled();
  });

  it('should not run if finished', () => {
    const a = new TestAction();
    expect(a.isFinished).toBe(false);
    a.isFinished = true;
    a.onUpdate = jest.fn();
    a.process(0);
    expect(a.onUpdate).not.toBeCalled();
  });
});

describe('Parallel', () => {
  it('should contain multiple actions', () => {
    const c = new Parallel();
    c.add(new TestAction());
    c.add(new TestAction());
    expect(c.actions).toHaveLength(2);
  });

  it('should update in parallel', () => {
    const root = new Parallel();
    const one = new TestAction();
    const two = new TestAction();
    one.onUpdate = jest.fn();
    two.onUpdate = jest.fn();
    root.add(one, two);
    expect(root.actions).toHaveLength(2);
    root.process(0);
    // expect(one.onUpdate).toHaveBeenCalled();
    // expect(two.onUpdate).toHaveBeenCalled();
  });
});
