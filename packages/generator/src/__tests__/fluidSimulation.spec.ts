import FluidSimulation, { FLOW_DIRECTION } from '../fluidSimulation';
import * as ndarray from 'ndarray';

const DIM = 5;
const size = {
  width: DIM,
  height: DIM,
  depth: DIM,
};
// test heightmap with walls around the edges and a hill in the center
const heightmap = ndarray([DIM * DIM], [DIM, DIM]);
heightmap.set(0, 0, 3);
heightmap.set(0, 1, 3);
heightmap.set(0, 2, 3);
heightmap.set(0, 3, 3);
heightmap.set(0, 4, 3);

heightmap.set(1, 0, 3);
heightmap.set(1, 1, 1);
heightmap.set(1, 2, 1);
heightmap.set(1, 3, 1);
heightmap.set(1, 4, 3);

heightmap.set(2, 0, 3);
heightmap.set(2, 1, 1);
heightmap.set(2, 2, 2); // hill in center of map
heightmap.set(2, 3, 1);
heightmap.set(2, 4, 3);

heightmap.set(3, 0, 3);
heightmap.set(3, 1, 1);
heightmap.set(3, 2, 1);
heightmap.set(3, 3, 1);
heightmap.set(3, 4, 3);

heightmap.set(4, 0, 3);
heightmap.set(4, 1, 1);
heightmap.set(4, 2, 1);
heightmap.set(4, 3, 0);
heightmap.set(4, 4, 3);

describe('FluidSimulation', () => {
  let sim;
  beforeEach(() => {
    sim = new FluidSimulation(size, heightmap);
  });
  it('should initialize correctly', () => {
    expect(sim.heightmap).toBeDefined();
    expect(sim.heightmap.data).toBeInstanceOf(Array);
    expect(sim.heightmap.get(0, 0)).toBe(3);
    
    // these are land:
    expect(sim.validCells.get(0, 0, 0)).toBe(0);
    expect(sim.validCells.get(0, 0, 1)).toBe(0);
    expect(sim.validCells.get(0, 0, 2)).toBe(0);

    // this is clear:
    expect(sim.validCells.get(0, 0, 3)).toBe(1);

    expect(sim.validCells.get(2, 2, 1)).toBe(0);
  });

  it('dropWater()', () => {
    // valid amounts
    expect(() => sim.dropWater(2, 2, 111)).toThrowError();
    expect(() => sim.dropWater(2, 2, 0)).toThrowError();
    expect(() => sim.dropWater(2, 2, -1)).toThrowError();

    sim.dropWater(2, 2, 1);
    expect(sim.waterAmounts.get(2, 2, 0)).toBe(0);
    expect(sim.waterAmounts.get(2, 2, 1)).toBe(0);
    expect(sim.waterAmounts.get(2, 2, 2)).toBe(1);
    expect(sim.waterAmounts.get(2, 2, 3)).toBe(0);
  });

  describe('simulate()', () => {
    it('flowing down', () => {
      sim.waterAmounts.set(4, 3, 4, 1);
      expect(sim.totalWater).toBe(1);
      expect(sim.waterAmounts.get(4, 3, 3)).toBe(0);
      expect(sim.waterAmounts.get(4, 3, 2)).toBe(0);
      expect(sim.waterAmounts.get(4, 3, 1)).toBe(0);

      sim.simulate();
      expect(sim.flowDirections.get(4, 3, 3, FLOW_DIRECTION.DOWN)).toBe(1);

      expect(sim.waterAmounts.get(4, 3, 4)).not.toBe(1);
      expect(sim.waterAmounts.get(4, 3, 3)).toBe(1);

      sim.simulate();
      expect(sim.flowDirections.get(4, 3, 2, FLOW_DIRECTION.DOWN)).toBe(1);

      expect(sim.waterAmounts.get(4, 3, 3)).not.toBe(1);
      expect(sim.waterAmounts.get(4, 3, 2)).toBe(1);

      sim.simulate();
      expect(sim.flowDirections.get(4, 3, 1, FLOW_DIRECTION.DOWN)).toBe(1);

      expect(sim.waterAmounts.get(4, 3, 2)).not.toBe(1);
      expect(sim.waterAmounts.get(4, 3, 1)).toBe(1);

      expect(sim.validCells.get(4, 3, 1)).toBe(1);
      expect(sim.validCells.get(4, 3, 0)).toBe(1);

      // water stops flowing at (4, 3, 0)
      sim.simulate();
      expect(sim.flowDirections.get(4, 3, 0, FLOW_DIRECTION.DOWN)).toBe(1);

      expect(sim.waterAmounts.get(4, 3, 0)).toBe(1);
      expect(sim.waterAmounts.get(4, 3, 0)).toBe(1);

      // does not disappear off the bottom of the map
      // dows not go up
      sim.simulate();
      expect(sim.flowDirections.get(4, 3, 0, FLOW_DIRECTION.DOWN)).toBe(0);
      expect(sim.flowDirections.get(4, 3, 0, FLOW_DIRECTION.UP)).toBe(0);
      expect(sim.waterAmounts.get(4, 3, 1)).not.toBe(1);
      expect(sim.waterAmounts.get(4, 3, 0)).toBe(1);
    });
  });
});
