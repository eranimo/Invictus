import * as ndarray from 'ndarray';
import * as fill from 'ndarray-fill';
import * as ops from 'ndarray-ops';


type Size3D = {
  width: number,
  height: number,
  depth: number
};

// Max and min cell liquid values
const MIN_WATER = 0.005;
const MAX_WATER = 1;

// Lowest and highest amount of liquids allowed to flow per iteration
const MIN_FLOW = 0.005;
const MAX_FLOW = 6; // one for each direction

const FLOW_SPEED = 1;

// Extra liquid a cell can store than the cell above it
const MAX_COMPRESSION = 0.25;

const SETTLE_COUNT_MAX = 10;

export enum FLOW_DIRECTION {
  UP,
  DOWN,
  NORTH,
  SOUTH,
  EAST,
  WEST,
}


export default class FluidSimulation {
  // input
  size: Size3D;
  heightmap: ndarray;

  // instanced

  /**
   * 0 = cell is not valid
   * 1 = cell is valid
   */
  validCells: ndarray;
  /**
   * An array of water amounts at each cell
   */
  waterAmounts: ndarray;
  /**
   * An array of the changes in the water levels for each cell each iteration
   */
  waterDiffs: ndarray;
  /**
   * An array keeping track of which cells don't need to be simulated because they are filled up
   */
  settledCells: ndarray;

  /**
   * an array of ticks that a cell has not had liquid flow.
   * If it's SETTLE_COUNT_MAX it is considered settled
   */
  settleCounts: ndarray;

  /**
   * An array of flow directions last time simulation() was called
   */
  flowDirections: ndarray;

  constructor(size: Size3D, heightmap: ndarray) {
    this.size = size;
    this.heightmap = heightmap;
    this.init();
  }

  /**
   * Instantiates arrays needed to simulate fluid simulation
   */
  private init() {
    this.validCells = this.createArray(Uint8ClampedArray);
    this.waterAmounts = this.createArray(Float32Array);
    this.waterDiffs = this.createArray(Float32Array);
    this.settledCells = this.createArray(Array);
    this.settleCounts = this.createArray(Uint8ClampedArray);
    
    const { width, height, depth } = this.size;
    this.flowDirections = ndarray(
      new Uint8ClampedArray(width * height * depth * 6), [width, height, depth, 6]
    );

    fill(this.validCells, (x, y, z) => z >= this.heightmap.get(x, y) ? 1 : 0);
    fill(this.waterAmounts, (x, y, z) => 0);
    fill(this.waterDiffs, (x, y, z) => 0);
    fill(this.settledCells, (x, y, z) => 0);
    fill(this.settleCounts, (x, y, z) => 0);
    fill(this.flowDirections, (x, y, z) => 0);
  }

  /**
   * creates an array with the size of the simulation
   * @param fn constructor function
   */
  private createArray(fn: any) {
    const { width, height, depth } = this.size;
    return ndarray(new fn(width * height * depth), [width, height, depth]);
  }

  /**
   * Calculates the flow value for two cells vertically
   * @param waterAmount amount of water in this cell
   * @param otherWaterAmount åmount of water in another cell
   */
  private calculateVerticalFlowValue(waterAmount, otherWaterAmount) {
    const sum = waterAmount + otherWaterAmount;
    if (sum <= MAX_WATER) {
      return MAX_WATER;
    }
    if (sum < 2 * MAX_WATER + MAX_COMPRESSION) {
      return (MAX_WATER * MAX_WATER + sum * MAX_COMPRESSION) / (MAX_WATER + MAX_COMPRESSION);
    }
    return (sum + MAX_COMPRESSION) / 2;
  }

  private depositWater(x: number, y: number, z: number, amount: number) {
    this.waterAmounts.set(x, y, z, this.waterAmounts.get(x, y, z) + amount);
  }

  private addWaterDiff(x: number, y: number, z: number, amount: number) {
    this.waterDiffs.set(x, y, z, this.waterDiffs.get(x, y, z) + amount);
  }

  private addSettleCount(x: number, y: number, z: number, amount: number) {
    this.settleCounts.set(x, y, z, this.settleCounts.get(x, y, z) + amount);
  }

  /**
   * Drops an amount of water on the lowest clear z-level
   * @param x x-coordinate
   * @param y y-coordinate
   * @param amount amount of water to add (between MIN_WATER and MAX_WATER)
   */
  public dropWater(x: number, y: number, amount: number) {
    if (amount < MIN_WATER || amount > MAX_WATER) {
      throw new Error(`Water must be between ${MIN_WATER} and ${MAX_WATER}, was ${amount}`);
    }
    let z = 0;
    while (z < this.size.depth) {
      const isClear = this.validCells.get(x, y, z) === 1;
      if (isClear) {
        this.depositWater(x, y, z, amount);
        return;
      }
      z++;
    }
  }

  private constrainFlow(flow, remainingWater) {
    let value = Math.max(flow, 0);
    const minPossibleFlow = Math.min(MAX_FLOW, remainingWater);
    if (value > minPossibleFlow) {
      value = minPossibleFlow;
    }
    return value;
  }

  public get totalWater() {
    return ops.sum(this.waterAmounts);
  }

  private isCellValid(x, y, z) {
    if (x < 0 || y < 0 || z < 0 ||
        x >= this.size.width || y >= this.size.height || z >= this.size.depth) {
      return false;
    }
    return this.validCells.get(x, y, z) === 1;
  }

  private resetFlowDirections(x: number, y: number, z: number) {
    for (let i = 0; i < 6; i++) {
      this.flowDirections.set(x, y, z, i, 0);
    }
  }

  private setFlowDirection(x: number, y: number, z: number, dir: FLOW_DIRECTION) {
    this.flowDirections.set(x, y, z, dir, 1);
  }

  /**
   * simulate water flowing
   */
  public simulate() {
    const { width, height, depth } = this.size;

    // reset diffs array
    fill(this.waterDiffs, (x, y, z) => 0);

    // main loop
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        for (let z = 0; z < depth; z++) {
          this.resetFlowDirections(x, y, z);
          const waterHere = this.waterAmounts.get(x, y, z);
          if (waterHere === 0) {
            continue;
          }

          const isSettled = this.settledCells.get(x, y, z);
          if (isSettled) {
            continue;
          }

          if (waterHere < MIN_WATER) {
            this.waterAmounts.set(x, y, z, MIN_WATER);
            continue;
          }

          const waterInitial = waterHere;
          let waterRemaining = waterHere;
          const up = [x, y, z + 1];
          const down = [x, y, z - 1];
          const north = [x, y - 1, z];
          const south = [x, y + 1, z];
          const west = [x - 1, y, z];
          const east = [x + 1, y, z];

          const isUpFree = this.isCellValid(up[0], up[1], up[2]);
          const isDownFree = this.isCellValid(down[0], down[1], down[2]);
          const isNorthFree = this.isCellValid(north[0], north[1], north[2]);
          const isSouthFree = this.isCellValid(south[0], south[1], south[2]);
          const isEastFree = this.isCellValid(east[0], east[1], east[2]);
          const isWestFree = this.isCellValid(west[0], west[1], west[2]);

          // flow to bottom cell
          if (isDownFree) {
            const downWater = this.waterAmounts.get(...down);

            // determine rate of flow
            let downFlow = this.calculateVerticalFlowValue(waterHere, downWater) - downWater;
            if (downWater > 0 && downFlow > MIN_FLOW) {
              downFlow *= FLOW_SPEED;
            }

            // constrain flow
            downFlow = this.constrainFlow(downFlow, waterRemaining);

            // update diffs
            if (downFlow !== 0) {
              waterRemaining -= downFlow;
              this.addWaterDiff(x, y, z, -downFlow);
              this.addWaterDiff(down[0], down[1], down[2], downFlow);
              this.setFlowDirection(down[0], down[1], down[2], FLOW_DIRECTION.DOWN);
              this.settledCells.set(down[0], down[1], down[2], 0);
            }
          }

          // if we're out of water, exit
          if (waterRemaining < MIN_WATER) {
            this.addWaterDiff(x, y, z, -waterRemaining);
            continue;
          }

          // flow to the north
          if (isNorthFree) {
            const northWater = this.waterAmounts.get(...north);

            // determine rate of flow
            let northFlow = (waterRemaining - northWater) / 6;
            if (northFlow > MIN_FLOW) {
              northFlow *= FLOW_SPEED;
            }

            // constrain flow
            northFlow = this.constrainFlow(northFlow, waterRemaining);

            // update diffs
            if (northFlow !== 0) {
              waterRemaining -= northFlow;
              this.addWaterDiff(x, y, z, -northFlow);
              this.addWaterDiff(north[0], north[1], north[2], northFlow);
              this.setFlowDirection(north[0], north[1], north[2], FLOW_DIRECTION.NORTH);
              this.settledCells.set(north[0], north[1], north[2], 0);
            }
          }

          // if we're out of water, exit
          if (waterRemaining < MIN_WATER) {
            this.addWaterDiff(x, y, z, -waterRemaining);
            continue;
          }

          // flow to the south
          if (isSouthFree) {
            const southWater = this.waterAmounts.get(...south);

            // determine rate of flow
            let southFlow = (waterRemaining - southWater) / 5;
            if (southFlow > MIN_FLOW) {
              southFlow *= FLOW_SPEED;
            }

            // constrain flow
            southFlow = this.constrainFlow(southFlow, waterRemaining);

            // update diffs
            if (southFlow !== 0) {
              waterRemaining -= southFlow;
              this.addWaterDiff(x, y, z, -southFlow);
              this.addWaterDiff(south[0], south[1], south[2], southFlow);
              this.setFlowDirection(south[0], south[1], south[2], FLOW_DIRECTION.SOUTH);
              this.settledCells.set(south[0], south[1], south[2], 0);
            }
          }

          // if we're out of water, exit
          if (waterRemaining < MIN_WATER) {
            this.addWaterDiff(x, y, z, -waterRemaining);
            continue;
          }

          // flow to the east
          if (isEastFree) {
            const eastWater = this.waterAmounts.get(...east);

            // determine rate of flow
            let eastFlow = (waterRemaining - eastWater) / 4;
            if (eastFlow > MIN_FLOW) {
              eastFlow *= FLOW_SPEED;
            }

            // constrain flow
            eastFlow = this.constrainFlow(eastFlow, waterRemaining);

            // update diffs
            if (eastFlow !== 0) {
              waterRemaining -= eastFlow;
              this.addWaterDiff(x, y, z, -eastFlow);
              this.addWaterDiff(east[0], east[1], east[2], eastFlow);
              this.setFlowDirection(east[0], east[1], east[2], FLOW_DIRECTION.EAST);
              this.settledCells.set(east[0], east[1], east[2], 0);
            }
          }

          // if we're out of water, exit
          if (waterRemaining < MIN_WATER) {
            this.addWaterDiff(x, y, z, -waterRemaining);
            continue;
          }

          // flow to the west
          if (isWestFree) {
            const westWater = this.waterAmounts.get(...west);

            // determine rate of flow
            let westFlow = (waterRemaining - westWater) / 4;
            if (westFlow > MIN_FLOW) {
              westFlow *= FLOW_SPEED;
            }

            // constrain flow
            westFlow = this.constrainFlow(westFlow, waterRemaining);

            // update diffs
            if (westFlow !== 0) {
              waterRemaining -= westFlow;
              this.addWaterDiff(x, y, z, -westFlow);
              this.addWaterDiff(west[0], west[1], west[2], westFlow);
              this.setFlowDirection(west[0], west[1], west[2], FLOW_DIRECTION.WEST);
              this.settledCells.set(west[0], west[1], west[2], 0);
            }
          }

          // if we're out of water, exit
          if (waterRemaining < MIN_WATER) {
            this.addWaterDiff(x, y, z, -waterRemaining);
            continue;
          }


          // flow to the top
          if (isUpFree) {
            const upWater = this.waterAmounts.get(...up);

            // determine rate of flow
            let upFlow = waterRemaining - this.calculateVerticalFlowValue(waterRemaining, upWater);
            if (upWater > 0 && upFlow > MIN_FLOW) {
              upFlow *= FLOW_SPEED;
            }

            // constrain flow
            upFlow = this.constrainFlow(upFlow, waterRemaining);

            // update diffs
            if (upFlow !== 0) {
              waterRemaining -= upFlow;
              this.addWaterDiff(x, y, z, -upFlow);
              this.addWaterDiff(up[0], up[1], up[2], upFlow);
              this.setFlowDirection(up[0], up[1], up[2], FLOW_DIRECTION.UP);
              this.settledCells.set(up[0], up[1], up[2], 0);
            }
          }

          // if we're out of water, exit
          if (waterRemaining < MIN_WATER) {
            this.addWaterDiff(x, y, z, -waterRemaining);
            continue;
          }

          // check if cell is settled
          if (waterInitial === waterRemaining) {
            this.addSettleCount(x, y, z, 1);
            if (this.settleCounts.get(x, y, z) > SETTLE_COUNT_MAX) {
              this.resetFlowDirections(x, y, z);
              this.settledCells.set(x, y, z, 1);
            }
          } else {
            // mark all neighbors as unsettled
            if (this.validCells.get(...up) !== undefined) {
              this.settledCells.set(up[0], up[1], up[2], 0);
            }
            if (this.validCells.get(...down) !== undefined) {
              this.settledCells.set(down[0], down[1], down[2], 0);
            }
            if (this.validCells.get(...north) !== undefined) {
              this.settledCells.set(north[0], north[1], north[2], 0);
            }
            if (this.validCells.get(...south) !== undefined) {
              this.settledCells.set(south[0], south[1], south[2], 0);
            }
            if (this.validCells.get(...east) !== undefined) {
              this.settledCells.set(east[0], east[1], east[2], 0);
            }
            if (this.validCells.get(...west) !== undefined) {
              this.settledCells.set(west[0], west[1], west[2], 0);
            }
          }
        }
      }
    }

    // update cell values
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        for (let z = 0; z < depth; z++) {
          const diff = this.waterDiffs.get(x, y, z);
          this.depositWater(x, y, z, diff);

          if (this.waterAmounts.get(x, y, z) < MIN_WATER) {
            this.waterAmounts.set(x, y, z, 0);
            this.settledCells.set(x, y, z, 0);
          }
        }
      }
    }
  }  
}
