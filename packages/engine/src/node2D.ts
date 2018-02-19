import Vector2D from 'victor';
import Node from './node';


export interface Node2DProps {
  position?: Vector2D;
}
export default class Node2D<T extends Node2DProps> extends Node<T> {
  static defaultProps = {
    position: new Vector2D(0, 0)
  };

  onPositionUpdate() {}

  setPosition(x: number, y: number) {
    this.props.position.x = x;
    this.props.position.y = y;
    this.onPositionUpdate();
  }

  changePosition(vector: Vector2D) {
    this.props.position.add(vector);
    this.onPositionUpdate();
  }
}
