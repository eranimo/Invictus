import Component from '../component';


interface IFoobar {
  bar: string
};
class Foobar extends Component<IFoobar> { }

describe('Component', () => {
  it('initial value', () => {
    const comp = new Foobar({
      bar: 'baz'
    });
    expect(comp.get('bar')).toBe('baz');
  });

  it('observable', () => {
    const comp = new Foobar({
      bar: 'baz'
    });
    expect(comp.get('bar')).toBe('baz');
    const mock = jest.fn();
    comp.subscribe(mock);
    comp.set('bar', 'faz');
    expect(mock).toBeCalledWith({ 'bar': 'faz' });
  });
});
