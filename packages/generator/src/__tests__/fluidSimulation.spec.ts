import FluidSimulation, { FLOW_DIRECTION } from '../fluidSimulation';
import * as ndarray from 'ndarray';
import { inRange } from 'lodash';

const DIM = 7;
const size = {
  width: DIM,
  height: DIM,
  depth: DIM,
};
// test heightmap with walls around the edges and a hill in the center
const heightmap = ndarray([DIM * DIM], [DIM, DIM]);
/**

3  3  3  3  3  3  3
3  1  1  1  3  3  3
3  1  2  1  3  3  3
3  1  1  1  3  3  3
3  1  1  0  3  3  3
3  3  3  3  3  3  3
3  3  0  3  3  3  3
3  3  3  3  3  3  3

 */
heightmap.set(0, 0, 3);
heightmap.set(0, 1, 3);
heightmap.set(0, 2, 3);
heightmap.set(0, 3, 3);
heightmap.set(0, 4, 3);
heightmap.set(0, 6, 3);
heightmap.set(0, 7, 3);

heightmap.set(1, 0, 3);
heightmap.set(1, 1, 1);
heightmap.set(1, 2, 1);
heightmap.set(1, 3, 1);
heightmap.set(1, 4, 3);
heightmap.set(1, 6, 3);
heightmap.set(1, 7, 3);

heightmap.set(2, 0, 3);
heightmap.set(2, 1, 1);
heightmap.set(2, 2, 2); // hill in center of map
heightmap.set(2, 3, 1);
heightmap.set(2, 4, 3);
heightmap.set(2, 6, 3);
heightmap.set(2, 7, 3);

heightmap.set(3, 0, 3);
heightmap.set(3, 1, 1);
heightmap.set(3, 2, 1);
heightmap.set(3, 3, 1);
heightmap.set(3, 4, 3);
heightmap.set(3, 6, 3);
heightmap.set(3, 7, 3);

heightmap.set(4, 0, 3);
heightmap.set(4, 1, 1);
heightmap.set(4, 2, 1);
heightmap.set(4, 3, 0);
heightmap.set(4, 4, 3);
heightmap.set(4, 6, 3);
heightmap.set(4, 7, 3);

heightmap.set(5, 0, 3);
heightmap.set(5, 1, 3);
heightmap.set(5, 2, 3);
heightmap.set(5, 3, 3);
heightmap.set(5, 4, 3);
heightmap.set(5, 6, 3);
heightmap.set(5, 7, 3);

heightmap.set(6, 0, 3);
heightmap.set(6, 1, 3);
heightmap.set(6, 2, 0);
heightmap.set(6, 3, 3);
heightmap.set(6, 4, 3);
heightmap.set(6, 6, 3);
heightmap.set(6, 7, 3);

heightmap.set(7, 0, 3);
heightmap.set(7, 1, 3);
heightmap.set(7, 2, 3);
heightmap.set(7, 3, 3);
heightmap.set(7, 4, 3);
heightmap.set(7, 6, 3);
heightmap.set(7, 7, 3);

describe('FluidSimulation', () => {
  let sim: FluidSimulation;
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
    sim.dropWater(6, 2, 1);
    expect(sim.waterAmounts.get(6, 2, 0)).toBe(1);
    expect(sim.waterAmounts.get(6, 2, 1)).toBe(0);
    expect(sim.waterAmounts.get(6, 2, 2)).toBe(0);
    expect(sim.waterAmounts.get(6, 2, 3)).toBe(0);

    sim.dropWater(6, 2, 1);
    expect(sim.waterAmounts.get(6, 2, 0)).toBe(1);
    expect(sim.waterAmounts.get(6, 2, 1)).toBe(1);
    expect(sim.waterAmounts.get(6, 2, 2)).toBe(0);
    expect(sim.waterAmounts.get(6, 2, 3)).toBe(0);

    sim.reset();

    sim.dropWater(6, 2, 3);
    expect(sim.waterAmounts.get(6, 2, 0)).toBe(1);
    expect(sim.waterAmounts.get(6, 2, 1)).toBe(1);
    expect(sim.waterAmounts.get(6, 2, 2)).toBe(1);
    expect(sim.waterAmounts.get(6, 2, 3)).toBe(0);
  });

  describe('simulate()', () => {
    it('flowing down', () => {
      sim.waterAmounts.set(4, 3, 4, 1);
      expect(sim.totalWater).toBe(1);
      expect(sim.waterAmounts.get(4, 3, 3)).toBe(0);
      expect(sim.waterAmounts.get(4, 3, 2)).toBe(0);
      expect(sim.waterAmounts.get(4, 3, 1)).toBe(0);

      sim.simulate();
      expect(sim.flowDirections.get(4, 3, 4, FLOW_DIRECTION.DOWN)).toBe(1);

      expect(sim.waterAmounts.get(4, 3, 4)).not.toBe(1);
      expect(sim.waterAmounts.get(4, 3, 3)).toBe(1);

      sim.simulate();
      expect(sim.flowDirections.get(4, 3, 3, FLOW_DIRECTION.DOWN)).toBe(1);

      expect(sim.waterAmounts.get(4, 3, 3)).not.toBe(1);
      expect(sim.waterAmounts.get(4, 3, 2)).toBe(1);

      sim.simulate();
      expect(sim.flowDirections.get(4, 3, 2, FLOW_DIRECTION.DOWN)).toBe(1);

      expect(sim.waterAmounts.get(4, 3, 2)).not.toBe(1);
      expect(sim.waterAmounts.get(4, 3, 1)).toBe(1);

      expect(sim.validCells.get(4, 3, 1)).toBe(1);
      expect(sim.validCells.get(4, 3, 0)).toBe(1);

      // water stops flowing at (4, 3, 0)
      sim.simulate();
      expect(sim.flowDirections.get(4, 3, 1, FLOW_DIRECTION.DOWN)).toBe(1);

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

    it('flowing to sides', () => {
      sim.waterAmounts.set(1, 1, 3, 1);
      expect(sim.totalWater).toBe(1);
      sim.simulate();
      expect(sim.flowDirections.get(1, 1, 3, FLOW_DIRECTION.DOWN)).toBe(1);
      sim.simulate();
      expect(sim.flowDirections.get(1, 1, 2, FLOW_DIRECTION.DOWN)).toBe(1);

      expect(sim.waterAmounts.get(1, 1, 1)).toBe(1);
      expect(sim.waterAmounts.get(1, 2, 1)).toBe(0);
      expect(sim.waterAmounts.get(2, 1, 1)).toBe(0);

      sim.simulate();
      // flowed south and to the east
      expect(sim.waterAmounts.get(1, 1, 1)).toBeCloseTo(0.6);
      expect(sim.waterAmounts.get(1, 2, 1)).toBeCloseTo(0.2);
      expect(sim.waterAmounts.get(2, 1, 1)).toBeCloseTo(0.2);

      // flowed more
      sim.simulate();
      expect(sim.waterAmounts.get(1, 1, 1)).toBeCloseTo(0.44);
      expect(sim.waterAmounts.get(1, 2, 1)).toBeCloseTo(0.24);
      expect(sim.waterAmounts.get(1, 3, 1)).toBeCloseTo(0.04);
      expect(sim.waterAmounts.get(2, 1, 1)).toBeCloseTo(0.23);
      expect(sim.waterAmounts.get(3, 1, 1)).toBeCloseTo(0.05);
    });

    it('flowing up', () => {
      sim.dropWater(6, 2, 1);
      expect(sim.waterAmounts.get(6, 2, 0)).toBe(1);
      expect(sim.totalWater).toBe(1);
      // water is on the bottom
      sim.simulate();
      expect(sim.waterAmounts.get(6, 2, 0)).toBe(1);
      expect(sim.waterAmounts.get(6, 2, 1)).toBe(0);
      // add more water to the bottom, increasing water pressure
      sim.waterAmounts.set(6, 2, 0, 3);

      sim.simulate();
      expect(sim.waterAmounts.get(6, 2, 0)).toBeCloseTo(1.625);
      expect(sim.waterAmounts.get(6, 2, 1)).toBeCloseTo(1.375); // flowed here
      expect(sim.waterAmounts.get(6, 2, 2)).toBeCloseTo(0);

      sim.simulate();
      expect(sim.waterAmounts.get(6, 2, 0)).toBeCloseTo(1.625);
      expect(sim.waterAmounts.get(6, 2, 1)).toBeCloseTo(1.075); // flowed here
      expect(sim.waterAmounts.get(6, 2, 2)).toBeCloseTo(0.3); // flowed here

      sim.simulate();
      expect(sim.waterAmounts.get(6, 2, 0)).toBeCloseTo(1.475); // flowed here
      expect(sim.waterAmounts.get(6, 2, 1)).toBeCloseTo(1.225); // flowed here
      expect(sim.waterAmounts.get(6, 2, 2)).toBeCloseTo(0.3);

      sim.simulate();
      expect(sim.waterAmounts.get(6, 2, 0)).toBeCloseTo(1.475);
      expect(sim.waterAmounts.get(6, 2, 1)).toBeCloseTo(1.105); // flowed here
      expect(sim.waterAmounts.get(6, 2, 2)).toBeCloseTo(0.42); // flowed here
      expect(sim.waterAmounts.get(6, 2, 3)).toBeCloseTo(0);

      sim.simulate();
      expect(sim.waterAmounts.get(6, 2, 0)).toBeCloseTo(1.414); // flowed here
      expect(sim.waterAmounts.get(6, 2, 1)).toBeCloseTo(1.164); // flowed here
      expect(sim.waterAmounts.get(6, 2, 2)).toBeCloseTo(0.42); // flowed here
      expect(sim.waterAmounts.get(6, 2, 3)).toBeCloseTo(0);
    });
  });
});
