import * as ndarray from 'ndarray';
import * as fill from 'ndarray-fill';


export enum CellType {
  WATER,
  LAND,
}

export interface CellExport {
  x: number;
  y: number;
  z: number;
  cellType: CellType;
}

export interface MapExport {
  width: number;
  height: number;
  depth: number;
  cells: Array<CellExport>
}

export class Cell {
  x: number;
  y: number;
  z: number;
  cellType: CellType | null;
  map: GameMap;

  constructor(x: number, y: number, z: number, map: GameMap) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.map = map;
    this.cellType = null;
  }

  get isClear() {
    return this.cellType === null;
  }

  get up(): Cell | null {
    return this.map.getCell(this.x, this.y, this.z + 1) || null;
  }

  get down(): Cell | null {
    return this.map.getCell(this.x, this.y, this.z - 1) || null;
  }

  get north(): Cell | null {
    return this.map.getCell(this.x - 1, this.y, this.z) || null;
  }

  get south(): Cell | null {
    return this.map.getCell(this.x + 1, this.y, this.z) || null;
  }

  get east(): Cell | null {
    return this.map.getCell(this.x, this.y + 1, this.z) || null;
  }

  get west(): Cell | null {
    return this.map.getCell(this.x, this.y - 1, this.z) || null;
  }

  export(): CellExport {
    return {
      x: this.x,
      y: this.y,
      z: this.z,
      cellType: this.cellType,
    };
  }
}

/**
 * Game map data structure
 */
export class GameMap {
  width: number;
  height: number;
  depth: number;

  grid: ndarray<Cell>;

  constructor(width: number, height: number, depth: number) {
    this.width = width;
    this.height = height;
    this.depth = depth;

    this.grid = ndarray([], [width, height, depth]);
  }

  /** Gets a cell at a coordinate */
  public getCell(x: number, y: number, z: number): Cell | null {
    if (
      x < 0 || y < 0 || z < 0 ||
      x >= this.width || y >= this.height || z >= this.depth
    ) {
      return null;
    }

    let cell = this.grid.get(x, y, z);

    if (!cell) {
      cell = new Cell(x, y, z, this);
      this.grid.set(x, y, z, (cell as any));
    }
    return cell;
  }

  get filledCells() {
    let cell;
    let count = 0;
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        for (let z = 0; z < this.depth; z++) {
          cell = this.getCell(x, y, z);
          if (cell && !cell.isClear) {
            count++;
          }
        }
      }
    }
    return count;
  }

  /**
   * Gets the cell visible from the given z-level looking down
   * returns null if all cells below z-level are clear
   */
  public getCellVisibleFromLevel(x: number, y: number, level: number): Cell | null {
    let currentLevel: number = level;
    let currentCell: Cell;
    while (currentLevel >= 0) {
      currentCell = this.getCell(x, y, currentLevel);
      if (!currentCell.isClear) {
        return currentCell;
      }
      currentLevel--;
    }
    return null;
  }

  /** Exports a map */
  public export(): MapExport {
    let cells = [];
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        for (let z = 0; z < this.depth; z++) {
          const cell = this.grid.get(x, y, z);
          if (cell) {
            cells.push(cell.export());
          }
        }
      }
    }
    return {
      width: this.width,
      height: this.height,
      depth: this.depth,
      cells,
    };
  }

  /** Imports a map */
  static import(data: MapExport): GameMap {
    const map = new GameMap(data.width, data.height, data.depth);
    for (const cellData of data.cells) {
      const cell = new Cell(cellData.x, cellData.y, cellData.z, map);
      cell.cellType = cellData.cellType;
      map.grid.set(cellData.x, cellData.y, cellData.z, (cell as any));
    }
    return map;
  }
}
