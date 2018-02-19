import Node2D, { Node2DProps } from './node2D';
import Vector2D from 'victor';
import { TileRef } from './tileset';
import Tilemap from './tilemap';


export interface TileProps extends Node2DProps {
  tileID: TileRef;
  colorReplacements?: number[][][];
}
export default class Tile<T extends TileProps> extends Node2D<T> {
  lastPosition: Vector2D;

  onReady() {
    super.onReady();
    this.addTile();
  }

  onPositionUpdate() {
    this.addTile();
  }
  
  private addTile() {
    const tilemap = this.parent as Tilemap<any>;
    if (this.lastPosition) {
      tilemap.clearTile(this.lastPosition)
    }
    tilemap.setCell(this.position, this.props.tileID);
    tilemap.setTileColorReplacements(this.position, this.props.colorReplacements);
    this.lastPosition = this.position.clone();
  }
}
