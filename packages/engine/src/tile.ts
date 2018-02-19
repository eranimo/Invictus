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
    tilemap.setCell(this.props.position, this.props.tileID);
    tilemap.setTileColorReplacements(this.props.position, this.props.colorReplacements);
    this.lastPosition = this.props.position.clone();
  }
}
