import * as ndarray from 'ndarray';
import Grid from '../grid';

console.log(ndarray);
const GRID_SIZE = 50;
describe('Grid', () => {
  interface ChunkGrid {
    height: ndarray;
  }
  let grid: Grid<ChunkGrid>;

  beforeEach(() => {
    grid = new Grid<ChunkGrid>(GRID_SIZE, GRID_SIZE, {
      height: ndarray([], [GRID_SIZE, GRID_SIZE]),
    });
  });

  it('import and export', () => {
    const g = Grid.import(GRID_SIZE, GRID_SIZE, {
      height: new Float32Array(GRID_SIZE * GRID_SIZE)
    });
    g.setField(0, 0, 'height', 10);
    expect(g.getField(0, 0, 'height')).toBe(10);

    expect(g.export()[0]).toBeInstanceOf(Object);
    expect(g.export()[0].height).toBeInstanceOf(Float32Array);
    expect(g.export()[1][0]).toBeInstanceOf(Float32Array);
  });

  describe('basic operations', () => {
    it('should allow field getting and setting', () => {
      grid.setField(0, 0, 'height', 1);
      expect(grid.getField(0, 0, 'height')).toBe(1);
    });

    it('cell toString', () => {
      expect(grid.getCell(0, 0).toString()).toBe('Cell(x: 0, y: 0)');
    });

    it('cell toPrimitive', () => {
      expect(+grid.getCell(0, 0)).toBe(0);
      expect(+grid.getCell(10, 10)).toBe(510);
      expect(`${grid.getCell(0, 0)}`).toBe('Cell(x: 0, y: 0)');
    });

    it('allows setting fields on the cell', () => {
      const cell = grid.getCell(0, 0);
      cell.data.height = 10;
      expect(grid.getField(0, 0, 'height')).toBe(10);
      cell.data.height = 11;
      expect(grid.getField(0, 0, 'height')).toBe(11);
      grid.setField(0, 0, 'height', 20);
      expect(cell.data.height).toBe(20);
    });

    it('should allow lookup of field properties on Cell objects using getCell', () => {
      grid.setField(0, 0, 'height', 1);
      expect(grid.getCell(0, 0).data.height).toBe(1);
      grid.setField(0, 0, 'height', 2);
      expect(grid.getCell(0, 0).data.height).toBe(2);
    });

    it('should only instantiate one cell per coordinate', () => {
      grid.setField(0, 0, 'height', 1);
      grid.setField(0, 1, 'height', 1);
      const cell1 = grid.getCell(0, 0);
      const cell2 = grid.getCell(0, 1);
      expect(cell1).toBe(grid.getCell(0, 0));
      expect(cell2).toBe(grid.getCell(0, 1));
      expect(cell1).not.toBe(cell2);
    });

    it('should instantiate when needed', () => {
      expect(grid.getCell(20, 20).data.height).toBe(undefined);
    })
  });

  it('distanceTo', () => {
    const cell1 = grid.getCell(25, 25);
    const cell2 = grid.getCell(25, 25);
    const cell3 = grid.getCell(25, 30);
    const cell4 = grid.getCell(35, 35);
    expect(cell1.distanceTo(cell2)).toBe(0);
    expect(cell1.distanceTo(cell3)).toBe(5);
    expect(cell1.distanceTo(cell4)).toBe(10 * Math.sqrt(2));
  });

  it('fourNeighbors', () => {
    const cell = grid.getCell(25, 25);
    const result = cell.fourNeighbors;
    expect(result).toHaveLength(4);
    expect(result).not.toContain(cell);
  });

  it('eightNeighbors', () => {
    const cell = grid.getCell(25, 25);
    const result = cell.eightNeighbors;
    expect(result).toHaveLength(8);
    expect(result).not.toContain(cell);
  });

  describe('cell neighborhoods', () => {
    it('cardinal direction methods', () => {
      grid.setField(5, 5, 'height', 1);
      const cell = grid.getCell(5, 5);

      expect(cell.cellUp).toBe(grid.getCell(5, 4));
      expect(cell.cellDown).toBe(grid.getCell(5, 6));
      expect(cell.cellLeft).toBe(grid.getCell(4, 5));
      expect(cell.cellRight).toBe(grid.getCell(6, 5));
    });

    describe('moore neighborhood', () => {
      it('at radius 0', () => {
        const cell = grid.getCell(25, 25);
        const neighborhood = cell.getMooreNeighborhood(0);
        expect(neighborhood).toHaveLength(1);
        expect(neighborhood[0]).toBe(cell);
      });
      it('at radius 1', () => {
        const cell = grid.getCell(25, 25);
        const neighborhood = cell.getMooreNeighborhood(1);
        expect(neighborhood).toHaveLength(9);
        expect(neighborhood).toContain(grid.getCell(24, 24)); // top left
        expect(neighborhood).toContain(grid.getCell(25, 25)); // center
        expect(neighborhood).toContain(grid.getCell(26, 26)); // bottom right
      });

      it('at radius 5', () => {
        const cell = grid.getCell(25, 25);
        const neighborhood = cell.getMooreNeighborhood(5);
        expect(neighborhood).toHaveLength(Math.pow(5 + 5 + 1, 2));
        expect(neighborhood).toContain(grid.getCell(20, 20)); // top left
        expect(neighborhood).toContain(grid.getCell(25, 25)); // center
        expect(neighborhood).toContain(grid.getCell(30, 30)); // bottom right
      });
    });

    describe('circular neighborhood', () => {
      it('at radius 0', () => {
        const cell = grid.getCell(25, 25);
        const neighborhood = cell.getCircularNeighborhood(0);
        expect(neighborhood).toHaveLength(1);
        expect(neighborhood[0]).toBe(cell);
      });

      it('at radius 1', () => {
        const cell = grid.getCell(25, 25);
        const neighborhood = cell.getCircularNeighborhood(1);
        expect(neighborhood).toHaveLength(5);
        expect(neighborhood).toContain(grid.getCell(25 - 1, 25)); // top
        expect(neighborhood).toContain(grid.getCell(25 + 1, 25)); // bottom
        expect(neighborhood).toContain(grid.getCell(25, 25 - 1)); // left
        expect(neighborhood).toContain(grid.getCell(25, 25 + 1)); // left
        expect(neighborhood).toContain(grid.getCell(25, 25)); // center
      });

      it('at radius 5', () => {
        const cell = grid.getCell(25, 25);
        const neighborhood = cell.getCircularNeighborhood(5);
        expect(neighborhood).toHaveLength(81);
        expect(neighborhood).toContain(grid.getCell(25, 25 - 5)); // top edge
        expect(neighborhood).toContain(grid.getCell(25, 25 + 5)); // bottom edge
        expect(neighborhood).toContain(grid.getCell(25 - 5, 25)); // left edge
        expect(neighborhood).toContain(grid.getCell(25 + 5, 25)); // right edge
        // should not contain the corners (it's a circle)
        expect(neighborhood).not.toContain(grid.getCell(25 - 5, 25 - 5)); // top left
        expect(neighborhood).not.toContain(grid.getCell(25 - 5, 25 + 5)); // top right
        expect(neighborhood).not.toContain(grid.getCell(25 - 5, 25 + 5)); // bottom left
        expect(neighborhood).not.toContain(grid.getCell(25 + 5, 25 + 5)); // bottom right
      })
    });

    describe('von neumann neighborhood', () => {
      it('at radius 0', () => {
        const cell = grid.getCell(25, 25);
        const neighborhood = cell.getVonNeumannNeighborhood(0);
        expect(neighborhood).toHaveLength(1);
        expect(neighborhood[0]).toBe(cell);
      });

      it('at radius 1', () => {
        const cell = grid.getCell(25, 25);
        const neighborhood = cell.getVonNeumannNeighborhood(1);
        expect(neighborhood).toHaveLength(2 * 1 * (1 + 1) + 1);
        expect(neighborhood).toContain(grid.getCell(25 - 1, 25)); // top
        expect(neighborhood).toContain(grid.getCell(25 + 1, 25)); // bottom
        expect(neighborhood).toContain(grid.getCell(25, 25 - 1)); // left
        expect(neighborhood).toContain(grid.getCell(25, 25 + 1)); // left
        expect(neighborhood).toContain(grid.getCell(25, 25)); // center
      });

      it('at radius 5', () => {
        const cell = grid.getCell(25, 25);
        const neighborhood = cell.getVonNeumannNeighborhood(5);
        expect(neighborhood).toHaveLength(2 * 5 * (5 + 1) + 1);
        expect(neighborhood).toContain(grid.getCell(25, 25 - 5)); // top edge
        expect(neighborhood).toContain(grid.getCell(25, 25 + 5)); // bottom edge
        expect(neighborhood).toContain(grid.getCell(25 - 5, 25)); // left edge
        expect(neighborhood).toContain(grid.getCell(25 + 5, 25)); // right edge
      });
    });

    it('clearing neighborhood cache', () => {
      const cell = grid.getCell(25, 25);
      cell.getVonNeumannNeighborhood(0);
      expect((cell.getVonNeumannNeighborhood as any).cache.has(0)).toBe(true);
      expect((cell.getVonNeumannNeighborhood as any).cache.has(1)).toBe(false);
      cell.clearCache();
      expect((cell.getVonNeumannNeighborhood as any).cache.has(0)).toBe(false);
    });
  });

  describe('cell search functions', () => {
    it('von neumann search', () => {
      const cell = grid.getCell(25, 25);
      grid.setField(30, 41, 'height', 100);
      const search = cell.vonNeumannSearch(cell => cell.data.height === 100, 50);
      expect(search).not.toBe(null);
      expect(search.data.height).toBe(100);
    });
  });
});
