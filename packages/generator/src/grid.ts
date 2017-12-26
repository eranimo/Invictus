import ndarray = require('ndarray');
import { Graph } from 'ngraph.graph';
import { memoize } from 'lodash';


interface CellData { [fieldName: string]: any };
interface INdarrayMap { [fieldName: string]: ndarray };

export class Cell<Fields> {
  x: number;
  y: number;
  grid: Grid<Fields>;
  data: any;

  getVonNeumannNeighborhood: (radius: number) => Array<Cell<Fields>>;
  getMooreNeighborhood: (radius: number) => Array<Cell<Fields>>;
  getCircularNeighborhood: (radius: number) => Array<Cell<Fields>>;

  constructor(x: number, y: number, grid: Grid<Fields>) {
    this.x = x;
    this.y = y;
    this.grid = grid;
    this.data = {};

    // add fields to the cell
    for (const key in this.grid.fields) {
      if (this.grid.fields.hasOwnProperty(key)) {
        Object.defineProperty(this.data, key, {
          enumerable: true,
          configurable: false,
          get: () => {
            return this.grid.getField(x, y, key);
          },
          set: (value: any) => {
            this.grid.setField(x, y, key, value);
          }
        });
      }
    }

    this.getVonNeumannNeighborhood = memoize(this._getVonNeumannNeighborhood);
    this.getMooreNeighborhood = memoize(this._getMooreNeighborhood);
    this.getCircularNeighborhood = memoize(this._getCircularNeighborhood);
  }

  clearCache() {
    (this.getVonNeumannNeighborhood as any).cache.clear();
    (this.getMooreNeighborhood as any).cache.clear();
    (this.getCircularNeighborhood as any).cache.clear();
  }

  get hash() {
    return `${this.x},${this.y}`;
  }

  /**
   * Gets all cells within a given radius of this cell
   * using the von Neumann neighborhood (diamond shape)
   * Returns an array of cells
   * @param radius
   */
  _getVonNeumannNeighborhood(radius: number = 1): Array<Cell<Fields>> {
    let result = []
    if (radius === 0) return [this];
    for (const cell of this.grid) {
      if (Math.abs(cell.x - this.x) + Math.abs(cell.y - this.y) <= radius) {
        result.push(cell);
      }
    }
    return result;
  }

  /**
   * Gets all cells within a given radius of this cell
   * using the Moore neighborhood (square shape)
   * @param radius 
   */
  _getMooreNeighborhood(radius: number = 1): Array<Cell<Fields>> {
    let result = [];
    if (radius === 0) return [this];
    for (const cell of this.grid) {
      if (
        Math.abs(cell.x - this.x) <= radius &&
        Math.abs(cell.y - this.y) <= radius
      ) {
        result.push(cell);
      }
    }
    return result;
  }

  /**
   * Gets all cells within a given radius of this cell
   * in the form of a circle shape
   * @param radius
   */
  _getCircularNeighborhood(radius: number = 1): Array<Cell<Fields>> {
    let result = new Set();
    if (radius === 0) return [this];
    // loop over the top-left quadrant of the circle, add the points on the other 3
    for (let x = this.x - radius; x <= this.x; x++) {
      for (let y = this.y - radius; y <= this.y; y++) {
        if (
          Math.pow(x - this.x, 2) + Math.pow(y - this.y, 2) <= Math.pow(radius, 2)
        ) {
          const xSim = this.x - (x - this.x);
          const ySim = this.y - (y - this.y);
          result.add(this.grid.getCell(x, y));
          result.add(this.grid.getCell(x, ySim));
          result.add(this.grid.getCell(xSim, y));
          result.add(this.grid.getCell(xSim, ySim));
        }
      }
    }
    return Array.from(result);
  }

  /**
   * Searches outwards from this cell in the moore neighborhood
   * until a test function returns true
   * @param cell how many rings
   * @param limit how many rings to search until it gives up
   * @returns Cell<Fields> or null if none found within limit
   */
  _search(
    neighborhoodFunc: (radius: number) => Array<Cell<Fields>>,
    testFunc: (cell: Cell<Fields>) => boolean,
    limit: number = 50
  ): Cell<Fields> | null {
    let searchedCells = new Set();
    let currentRadius = 0;

    // expand radius until we're at the limit
    while (currentRadius < limit) {
      const cells = neighborhoodFunc(currentRadius).filter(cell => !searchedCells.has(cell));
      for (const cell of cells) {
        if (testFunc(cell)) {
          return cell;
        }
        searchedCells.add(cell);
      }
      currentRadius++;
    }
    return null; // not found
  }

  mooreSearch(
    testFunc: (cell: Cell<Fields>) => boolean,
    limit: number = 50
  ): Cell<Fields> | null {
    return this._search(this.getMooreNeighborhood.bind(this), testFunc, limit);
  }

  vonNeumannSearch(
    testFunc: (cell: Cell<Fields>) => boolean,
    limit: number = 50
  ): Cell<Fields> | null {
    return this._search(this.getVonNeumannNeighborhood.bind(this), testFunc, limit);
  }

  circularSearch(
    testFunc: (cell: Cell<Fields>) => boolean,
    limit: number = 10
  ): Cell<Fields> | null {
    return this._search(this.getVonNeumannNeighborhood.bind(this), testFunc, limit);
  }

  get cellUp() {
    return this.grid.getCell(this.x, this.y - 1);
  }

  get cellDown() {
    return this.grid.getCell(this.x, this.y + 1);
  }

  get cellLeft() {
    return this.grid.getCell(this.x - 1, this.y);
  }

  get cellRight() {
    return this.grid.getCell(this.x + 1, this.y);
  }

  get fourNeighbors(): Array<Cell<Fields>> {
    const results = [];
    const up = this.grid.getCell(this.x, this.y - 1);
    const down = this.grid.getCell(this.x, this.y + 1);
    const left = this.grid.getCell(this.x - 1, this.y);
    const right = this.grid.getCell(this.x + 1, this.y);
    if (up) results.push(up);
    if (down) results.push(down);
    if (left) results.push(left);
    if (right) results.push(right);
    return results;
  }

  get eightNeighbors(): Array<Cell<Fields>> {
    const result = this.getMooreNeighborhood(1);
    return result.filter(cell => cell != this);
  }

  distanceTo(cell: Cell<Fields>): number {
    return Math.sqrt(Math.pow(cell.x - this.x, 2) + Math.pow(cell.y - this.y, 2));
  }

  /** Allows strict equality checking */
  [Symbol.toPrimitive](hint: string) {
    if (hint === 'string') {
      return this.toString();
    }
    if (hint === 'number') {
      return this.x + this.y * this.grid.width;
    }
    return false;
  }

  toString() {
    return `Cell(x: ${this.x}, y: ${this.y})`;
  }

  get index() {
    return this.y + (this.x * this.grid.width);
  }

  [Symbol.toStringTag]() {
    return 'Cell';
  }
}

export default class Grid<Fields> {
  width: number;
  height: number;
  fields: INdarrayMap;
  _cells: { [hash: string]: Cell<Fields> };

  constructor(width: number, height: number, fields: INdarrayMap) {
    this.width = width;
    this.height = height;
    this.fields = fields;
    this._cells = {};
  }

  /** Get a cell in the grid, create an instance if it doesn't already exist */
  getCell(x: number, y: number): Cell<Fields> {
    const hashKey = `${x},${y}`;
    if (hashKey in this._cells) {
      return this._cells[hashKey];
    }
    const cell = new Cell(x, y, this);
    this._cells[hashKey] = cell;
    return cell;
  }

  getCellFromIndex(index: number): Cell<Fields> {
    const x = Math.floor(index / this.width);
    const y = index % this.width;
    return this.getCell(x, y);
  }

  /** Allow iteration over the cells in the grid */
  [Symbol.iterator] = function *(): Iterator<Cell<Fields>> {
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        yield this.getCell(x, y);
      }
    }
  }

  /** Get a field's value on the grid */
  getField(x: number, y: number, fieldName: string) {
    if (!(fieldName in this.fields)) {
      throw new Error(`Field ${fieldName} does not exist in Grid`);
    }
    return this.fields[fieldName].get(x, y);
  }
  
  /** Set a field on the grid to a value */
  setField(x: number, y: number, fieldName: string, value: any) {
    if (!(fieldName in this.fields)) {
      throw new Error(`Field ${fieldName} does not exist in Grid`);
    }
    this.fields[fieldName].set(x, y, value);
  }

  /**
   * Exports the Grid object into an object of the ArrayBuffer fields and a transferable list
   */
  export(): [{ [fieldName: string]: ArrayBuffer }, Array<ArrayBuffer>] {
    let result = {};
    for (const [key, value] of Object.entries(this.fields)) {
      result[key] = value.data;
    }
    return [result, Object.values(result)];
  }

  /**
   * Imports a grid from an object of ArrayBuffer instances
   * @param width width of the grid
   * @param height height of the grid
   * @param fields Object of fieldName to ArrayBuffer instances
   */
  static import(width: number, height: number, fields: { [fieldname: string]: any }) {
    const result = {};
    for (const [key, value] of Object.entries(fields)) {
      result[key] = ndarray(value, [width, height]);
    }
    return new Grid(width, height, result);
  }

  [Symbol.toStringTag]() {
    return 'Grid';
  }
}

