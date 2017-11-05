import Agent from '../index';


let agent: Agent;
beforeEach(() => {
  agent = new Agent();
});

test('Agent', () => {
  expect(agent.actions.length).toBe(1);
});
