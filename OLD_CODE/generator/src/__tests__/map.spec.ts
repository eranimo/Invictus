import { GameMap, CellType } from '../map';

function makeLandRect(map: GameMap, cellType: CellType, x1, y1, x2, y2, z) {
  for (let x = x1; x < x2; x++) {
    for (let y = y1; y < y2; y++) {
      const cell = map.getCell(x, y, z);
      cell.cellType = cellType;
    }
  }
}

describe('GameMap', () => {
  let map: GameMap;
  beforeEach(() => {
    map = new GameMap(10, 10, 10);
    // lake with a tall island in the center
    makeLandRect(map, CellType.LAND, 0, 0, 10, 10, 0);
    makeLandRect(map, CellType.LAND, 0, 0, 10, 10, 1);
    makeLandRect(map, CellType.WATER, 2, 2, 8, 8, 1);
    makeLandRect(map, CellType.LAND, 4, 4, 6, 6, 1);
    makeLandRect(map, CellType.LAND, 4, 4, 6, 6, 2);
  });

  it('filledCells property', () => {
    expect(map.filledCells).toBe(204);
  });

  it('should trace the top cell', () => {
    expect(map.getCellVisibleFromLevel(0, 0, 5)).toBe(map.getCell(0, 0, 1));
    expect(map.getCellVisibleFromLevel(4, 4, 1)).toBe(map.getCell(4, 4, 1));
  })
});
