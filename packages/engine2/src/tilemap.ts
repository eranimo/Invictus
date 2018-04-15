import ndarray from 'ndarray';


interface TilemapOptions {
  width: number;
  height: number;
}

class Tilemap {
  options: TilemapOptions;
  grid: ndarray;

  constructor(options: TilemapOptions) {
    this.options = options;
    this.grid = ndarray([], [options.width, options.height]);
  }
}
